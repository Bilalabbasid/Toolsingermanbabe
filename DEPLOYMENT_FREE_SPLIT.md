# CoolWave free split deployment

This setup keeps the public website responsive while the conversion container scales to zero:

- `coolwave.cool` runs the Next.js frontend on Vercel.
- `api.coolwave.cool` runs the existing Docker image on Azure Container Apps Consumption.
- Files travel directly from the browser to Azure. Vercel never proxies uploads.
- PostgreSQL, Redis, Stripe, R2, and an always-on VM are not required for the initial single-replica launch.

## 1. Publish the Docker image with GitHub Actions

The repository includes `.github/workflows/deploy-container.yml`. A push to `main` builds `linux/amd64` and publishes both of these tags:

```text
ghcr.io/bilalabbasid/coolwave:latest
ghcr.io/bilalabbasid/coolwave:<git-commit-sha>
```

1. Push the repository to `main`.
2. Open GitHub → **Toolsingermanbabe** → **Actions** → **Build and deploy conversion container**.
3. Wait for **Build and publish Docker image** to finish.
4. Open the package from the repository page or `https://github.com/users/Bilalabbasid/packages/container/coolwave/settings`.
5. Under **Danger Zone → Change package visibility**, make `coolwave` public. Azure can then pull it without paid registry credentials.

The workflow initially skips its Azure job because the Azure repository variables do not exist yet. That is expected.

## 2. Create the free scale-to-zero Azure backend

Open `https://shell.azure.com`, select **Bash**, and run this complete block. It generates secrets inside Azure Cloud Shell and never stores them in GitHub or the repository.

```bash
az extension add --name containerapp --upgrade
az provider register --namespace Microsoft.App --wait
az provider register --namespace Microsoft.OperationalInsights --wait

RESOURCE_GROUP="coolwave-rg"
LOCATION="germanywestcentral"
CONTAINER_ENV="coolwave-env"
CONTAINER_APP="coolwave-api"
IMAGE="ghcr.io/bilalabbasid/coolwave:latest"

AUTH_SECRET="$(openssl rand -hex 32)"
ADMIN_SECRET="$(openssl rand -hex 32)"
CRON_SECRET="$(openssl rand -hex 32)"
DOWNLOAD_SECRET="$(openssl rand -hex 32)"

az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

az containerapp env create \
  --name "$CONTAINER_ENV" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --environment-mode WorkloadProfiles \
  --logs-destination none

az containerapp create \
  --name "$CONTAINER_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$CONTAINER_ENV" \
  --image "$IMAGE" \
  --ingress external \
  --target-port 3000 \
  --transport auto \
  --revisions-mode single \
  --cpu 2.0 \
  --memory 4.0Gi \
  --min-replicas 0 \
  --max-replicas 1 \
  --scale-rule-name coolwave-http \
  --scale-rule-http-concurrency 1 \
  --secrets \
    auth-secret="$AUTH_SECRET" \
    admin-secret="$ADMIN_SECRET" \
    cron-secret="$CRON_SECRET" \
    download-secret="$DOWNLOAD_SECRET" \
  --env-vars \
    NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_PUBLIC_SITE_URL=https://coolwave.cool \
    NEXTAUTH_URL=https://coolwave.cool \
    NEXT_PUBLIC_ENABLE_ACCOUNTS=false \
    NEXT_PUBLIC_ENABLE_STRIPE=false \
    NEXT_PUBLIC_ENABLE_BUSINESS_TIER=false \
    NEXT_PUBLIC_ENABLE_HISTORY=false \
    NEXT_PUBLIC_ENABLE_ADS=false \
    CORS_ALLOWED_ORIGINS=https://coolwave.cool,https://www.coolwave.cool \
    AUTH_SECRET=secretref:auth-secret \
    ADMIN_SECRET=secretref:admin-secret \
    CRON_SECRET=secretref:cron-secret \
    DOWNLOAD_SIGNING_SECRET=secretref:download-secret \
    TRUST_PROXY=true \
    COOLWAVE_TEMP_DIR=/tmp/coolwave \
    TEMP_FILE_RETENTION_MINUTES=15 \
    CLEANUP_INTERVAL_MINUTES=5 \
    AUTO_DELETE_ON_DOWNLOAD=true \
    PROCESSING_TIMEOUT_MS=180000 \
    OCR_TIMEOUT_MS=300000 \
    SERVER_CONCURRENCY=1 \
    MAX_OCR_CONCURRENCY=1 \
    MAX_FILE_SIZE_FREE=50

AZURE_API_HOST="$(az containerapp show --name "$CONTAINER_APP" --resource-group "$RESOURCE_GROUP" --query properties.configuration.ingress.fqdn --output tsv)"
echo "Backend URL: https://${AZURE_API_HOST}"
curl --fail --retry 8 --retry-delay 5 "https://${AZURE_API_HOST}/api/health/ready"
```

Expected health response:

```json
{"ready":true,"timestamp":"..."}
```

Do not configure `DATABASE_URL`, `REDIS_URL`, Stripe variables, or R2 variables for this launch.

## 3. Give the backend its API domain

1. Open Azure Portal → **Container Apps** → **coolwave-api** → **Custom domains**.
2. Select **Add custom domain** and enter `api.coolwave.cool`.
3. At the DNS provider for `coolwave.cool`, add the exact CNAME and TXT validation records shown by Azure.
4. Return to Azure and choose the free managed certificate.
5. Wait until the binding reports **Secured**.
6. Verify `https://api.coolwave.cool/api/health/ready` returns `ready: true`.

Keep the DNS record unproxied while Azure issues and renews its managed certificate. If Cloudflare manages DNS, use **DNS only** for `api`.

## 4. Deploy the frontend on Vercel

1. Sign in at `https://vercel.com` with GitHub.
2. Select **Add New → Project**.
3. Import `Bilalabbasid/Toolsingermanbabe`.
4. Keep the detected framework as **Next.js**, root directory as `./`, build command as `npm run build`, and output settings at their defaults.
5. Add these Production and Preview environment variables:

```env
NEXT_PUBLIC_SITE_URL=https://coolwave.cool
NEXTAUTH_URL=https://coolwave.cool
NEXT_PUBLIC_API_BASE_URL=https://api.coolwave.cool
NEXT_PUBLIC_ENABLE_ACCOUNTS=false
NEXT_PUBLIC_ENABLE_STRIPE=false
NEXT_PUBLIC_ENABLE_BUSINESS_TIER=false
NEXT_PUBLIC_ENABLE_HISTORY=false
NEXT_PUBLIC_ENABLE_ADS=false
COOLWAVE_DEPLOYMENT_ROLE=frontend
```

6. Generate a separate frontend secret locally and add it as `AUTH_SECRET` in Vercel:

```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToHexString($bytes).ToLower()
```

7. Deploy the Vercel project.
8. In Vercel → **Project Settings → Domains**, add `coolwave.cool` and `www.coolwave.cool`.
9. Add the DNS records Vercel displays. Use Vercel's displayed values rather than copying values from an older guide.
10. Configure `www.coolwave.cool` to redirect to `coolwave.cool`.

The browser now loads pages from Vercel and sends files directly to `api.coolwave.cool`. Opening a server-backed tool starts the Azure container before the visitor presses Convert.

## 5. Enable automatic Azure deployments with secure OIDC

Run this in Azure Cloud Shell after the resource group exists:

```bash
RESOURCE_GROUP="coolwave-rg"
GITHUB_APP_NAME="coolwave-github-actions"

SUBSCRIPTION_ID="$(az account show --query id --output tsv)"
TENANT_ID="$(az account show --query tenantId --output tsv)"
CLIENT_ID="$(az ad app create --display-name "$GITHUB_APP_NAME" --query appId --output tsv)"
SERVICE_PRINCIPAL_OBJECT_ID="$(az ad sp create --id "$CLIENT_ID" --query id --output tsv)"
RESOURCE_GROUP_ID="$(az group show --name "$RESOURCE_GROUP" --query id --output tsv)"

az role assignment create \
  --assignee-object-id "$SERVICE_PRINCIPAL_OBJECT_ID" \
  --assignee-principal-type ServicePrincipal \
  --role Contributor \
  --scope "$RESOURCE_GROUP_ID"

cat > coolwave-federated-credential.json <<'JSON'
{
  "name": "coolwave-production",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:Bilalabbasid/Toolsingermanbabe:environment:production",
  "description": "Deploy main branch builds through the protected production environment",
  "audiences": ["api://AzureADTokenExchange"]
}
JSON

az ad app federated-credential create \
  --id "$CLIENT_ID" \
  --parameters coolwave-federated-credential.json

echo "AZURE_CLIENT_ID=$CLIENT_ID"
echo "AZURE_TENANT_ID=$TENANT_ID"
echo "AZURE_SUBSCRIPTION_ID=$SUBSCRIPTION_ID"
```

In GitHub → **Toolsingermanbabe → Settings → Environments**, create an environment named exactly `production`.

Under that environment, create these secrets using the values printed above:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

Then open **Settings → Secrets and variables → Actions → Variables** and create these repository variables. They must be repository variables because GitHub evaluates the workflow's deploy-job condition before it opens the `production` environment:

- `AZURE_CONTAINER_APP_NAME` = `coolwave-api`
- `AZURE_RESOURCE_GROUP` = `coolwave-rg`

Run **Actions → Build and deploy conversion container → Run workflow**. The deploy job should create a new Azure Container Apps revision using the immutable commit-SHA image.

## 6. Production verification

Verify these in order:

1. Open `https://coolwave.cool/de` in a private browser window.
2. Open `https://coolwave.cool/de/pdf-in-word-umwandeln`.
3. Confirm the blue **Konverter wird vorbereitet** notice appears after Azure has scaled to zero.
4. Confirm `https://api.coolwave.cool/api/health/ready` changes to `ready: true`.
5. Convert a normal text PDF to Word and verify the DOCX text is editable.
6. Convert a scanned PDF to Word and verify OCR output.
7. Test a file larger than 4.5 MB to confirm the browser uploads directly to Azure.
8. Confirm a conversion from an unrelated website origin receives HTTP 403.
9. Wait at least five minutes and repeat to measure the real cold-start time.
10. In Azure, confirm **coolwave-api → Scale** shows minimum `0` and maximum `1`.

## 7. Cost protection

- Keep minimum replicas at `0` until traffic justifies an always-warm instance.
- Keep maximum replicas at `1` while storage and queue state are local.
- The environment uses `--logs-destination none`, avoiding a separately billed Log Analytics workspace. Live logs remain available through Azure's log stream.
- Create an Azure Cost Management budget with alerts at 50%, 80%, and 100% of the amount you are willing to spend. Azure budgets alert; they do not automatically stop resources.
- Do not send periodic uptime-monitor pings. They prevent scale-to-zero and consume the free allowance.

## 8. Rollback

Every deployment uses the Git commit SHA as its image tag. To roll back:

1. Open Azure Portal → **coolwave-api → Revisions and replicas**.
2. Select a previously working revision.
3. Activate it and route 100% of traffic to it, or update the app to its previous `ghcr.io/bilalabbasid/coolwave:<commit-sha>` image.

Do not delete the prior image until the new revision has passed the production verification list.
