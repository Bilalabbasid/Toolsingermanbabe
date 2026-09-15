# CoolWave Automated & Manual Testing Guide

This document outlines the testing architecture, commands, automated test suites, and end-to-end verification workflows.

---

## 1. Automated Test Runner (Vitest)

CoolWave uses [Vitest](https://vitest.dev/) for blazing-fast unit and integration testing.

### Test Commands
```bash
# Run all test suites
npm test

# Run tests in watch mode during development
npx vitest

# Run unit tests only
npm run test:unit

# Generate code coverage report
npm run test:coverage
```

---

## 2. Production Database Safeguard

To ensure tests never run against a production database, [`test/setup.ts`](./test/setup.ts) includes a hardcoded environment guard:

```ts
// Automatically halts test execution if DATABASE_URL matches Azure or production identifiers
if (dbUrl.includes('azure.com') || dbUrl.includes('production') || dbUrl.includes('prod')) {
  throw new Error('SICHERHEITSABBRUCH: Test-Lauf gegen Produktions-Datenbank erkannt!');
}
```

---

## 3. Automated Test Suites

| Test Suite | File | What It Verifies |
| :--- | :--- | :--- |
| **Authentication** | [`test/auth.test.ts`](./test/auth.test.ts) | Bcrypt password hashing (cost 12), token entropy, session creation, password validation rules, non-admin blocked from admin guards, admin permitted. |
| **Entitlements** | [`test/entitlements.test.ts`](./test/entitlements.test.ts) | Free tier quotas (50 MB, 3 batch files, ads enabled), Pro tier quotas (500 MB, 50 batch files, ads disabled, priority engine), server-side action validation. |
| **Stripe Billing** | [`test/stripe.test.ts`](./test/stripe.test.ts) | Graceful startup when keys are absent, customer creation error isolation, signature validation fallback. |
| **Admin Controls** | [`test/admin.test.ts`](./test/admin.test.ts) | Dynamic merging of static code registry and operational DB overrides, settings listing and default fallback values. |
| **PDF Redaction** | [`test/redaction.test.ts`](./test/redaction.test.ts) | Demonstrates why whiteout visual overlay is not true redaction and verifies generated PDFs remain structurally valid. |
| **Health Checks** | [`test/health.test.ts`](./test/health.test.ts) | Health & readiness endpoints return valid JSON without leaking secrets, connection strings, or private keys. |

---

## 4. End-to-End Manual Verification Checklist

Follow this workflow to verify all user journeys:

### Journey 1: Anonymous Visitor (Conversion & Download)
1. Open the homepage at `http://localhost:3000/de`.
2. Select any tool (e.g. `PDF zusammenfügen` or `PDF komprimieren`).
3. Upload a file and execute the conversion.
4. Download the resulting file.
5. **Verify**: No signup prompt was forced; the conversion completed smoothly and file download succeeded.

### Journey 2: Registered User (Account & Limits)
1. Go to `http://localhost:3000/de/register`.
2. Fill out name, email, and a password (&ge; 8 characters).
3. Upon registration, you are directed to `http://localhost:3000/de/konto`.
4. Check that your account information, current plan (`FREE`), and file size quotas (50 MB) are displayed.
5. Log out via the header or account page and log back in at `/de/login`.
6. **Verify**: Session persists via HTTP-only cookie.

### Journey 3: Administrator Panel
1. Promote your user to admin via CLI:
   ```bash
   npm run admin:create
   ```
2. Log in and navigate to `http://localhost:3000/de/admin`.
3. Open the **Tools** tab, search for a tool, and click **Konfigurieren**.
4. Change its status or file size limit and click **Konfiguration speichern**.
5. Switch to the **Audit-Logs** tab.
6. **Verify**: The configuration updated immediately and an immutable `TOOL_CONFIG_UPDATED` audit record was generated.
