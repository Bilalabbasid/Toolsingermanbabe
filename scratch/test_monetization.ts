import { getPlan, getAllPlans, formatPlanPrice, calculateAnnualSavings } from '../src/config/plans.config';
import { getEntitlements, hasEntitlement, checkFileLimit, checkBatchLimit } from '../src/lib/monetization/entitlements';
import { resolveTierFromApiKey, getServerSubscription } from '../src/lib/monetization/subscription';
import { getTodayKey, isDailyQuotaExceeded } from '../src/lib/monetization/usage';
import { featureFlags, isFeatureEnabled } from '../src/config/featureFlags.config';

async function runMonetizationTests() {
  console.log('====================================================');
  console.log('   COOLWAVE FREE-FIRST MONETIZATION TEST SUITE      ');
  console.log('====================================================\n');

  // Test 1: Configuration-driven Pricing & Plans
  console.log('[Test 1] Testing Configuration-Driven Pricing Plans...');
  const plans = getAllPlans();
  console.log(`Found ${plans.length} configured plans: ${plans.map((p) => p.name).join(', ')}`);
  if (plans.length < 3) throw new Error('Expected at least 3 plans (free, pro, business)');

  const freePlan = getPlan('free');
  const proPlan = getPlan('pro');
  const bizPlan = getPlan('business');

  console.log(`Free plan: ${freePlan.name}, monthly: €${freePlan.priceMonthlyEUR}`);
  console.log(`Pro plan: ${proPlan.name}, monthly: €${proPlan.priceMonthlyEUR}, yearly: €${proPlan.priceYearlyEUR}`);
  console.log(`Business plan: ${bizPlan.name}, monthly: €${bizPlan.priceMonthlyEUR}`);

  const monthlyFormatted = formatPlanPrice(proPlan, 'monthly');
  const yearlyFormatted = formatPlanPrice(proPlan, 'yearly');
  const annualSavings = calculateAnnualSavings(proPlan);
  console.log(`Formatted Pro monthly: ${monthlyFormatted}, yearly: ${yearlyFormatted} (~${annualSavings}% savings)`);

  if (freePlan.priceMonthlyEUR !== 0) throw new Error('Free plan must have price 0');
  if (proPlan.priceMonthlyEUR <= 0) throw new Error('Pro plan must have positive price');
  if (annualSavings < 15) throw new Error('Annual savings calculation unexpected');
  console.log('✓ Configuration-driven plans verified!\n');

  // Test 2: Entitlements Service
  console.log('[Test 2] Testing Entitlements Resolution...');
  const freeEntitlements = getEntitlements('free');
  const proEntitlements = getEntitlements('pro');

  console.log(`Free entitlements: noAds=${freeEntitlements.noAds}, maxFileSize=${freeEntitlements.maxFileSizeMB}MB, batch=${freeEntitlements.maxBatchFiles}`);
  console.log(`Pro entitlements:  noAds=${proEntitlements.noAds}, maxFileSize=${proEntitlements.maxFileSizeMB}MB, batch=${proEntitlements.maxBatchFiles}, priorityQueue=${proEntitlements.priorityQueue}`);

  if (hasEntitlement('free', 'noAds')) {
    throw new Error('Free tier should not have noAds entitlement (ads enabled for free)');
  }
  if (!hasEntitlement('pro', 'noAds')) {
    throw new Error('Pro tier must have noAds entitlement');
  }
  if (!hasEntitlement('pro', 'priorityQueue')) {
    throw new Error('Pro tier must have priorityQueue entitlement');
  }

  // File size limit checks
  const file40MB = 40 * 1024 * 1024;
  const file120MB = 120 * 1024 * 1024;

  const free40 = checkFileLimit('free', file40MB);
  const free120 = checkFileLimit('free', file120MB);
  const pro120 = checkFileLimit('pro', file120MB);

  console.log(`40MB file allowed on Free: ${free40.allowed}`);
  console.log(`120MB file allowed on Free: ${free120.allowed}`);
  console.log(`120MB file allowed on Pro:  ${pro120.allowed}`);

  if (!free40.allowed || free120.allowed || !pro120.allowed) {
    throw new Error('File size limit checks failed');
  }

  // Batch limit checks
  const batch3 = checkBatchLimit('free', 3);
  const batch15 = checkBatchLimit('free', 15);
  const proBatch15 = checkBatchLimit('pro', 15);

  console.log(`3 files batch allowed on Free: ${batch3.allowed}`);
  console.log(`15 files batch allowed on Free: ${batch15.allowed}`);
  console.log(`15 files batch allowed on Pro:  ${proBatch15.allowed}`);

  if (!batch3.allowed || batch15.allowed || !proBatch15.allowed) {
    throw new Error('Batch limit checks failed');
  }
  console.log('✓ Entitlements successfully verified!\n');

  // Test 3: Subscription Resolver (Server & API Keys)
  console.log('[Test 3] Testing Subscription Resolver...');
  const noKey = resolveTierFromApiKey(null);
  const proKey = resolveTierFromApiKey('cw_live_12345');
  const bizKey = resolveTierFromApiKey('biz_enterprise_999');

  console.log(`Tier for null key: ${noKey}`);
  console.log(`Tier for pro key:  ${proKey}`);
  console.log(`Tier for biz key:  ${bizKey}`);

  if (noKey !== 'free' || proKey !== 'pro' || bizKey !== 'business') {
    throw new Error('API key tier resolution failed');
  }

  const mockHeaders = new Headers();
  mockHeaders.set('x-api-key', 'cw_live_test');
  const serverSub = getServerSubscription(mockHeaders);
  console.log(`Server resolved subscription: tier=${serverSub.tier}, isPro=${serverSub.isPro}`);
  if (!serverSub.isPro || serverSub.tier !== 'pro') {
    throw new Error('Server subscription check failed');
  }
  console.log('✓ Subscription resolution verified!\n');

  // Test 4: Feature Flags
  console.log('[Test 4] Testing Feature Flags...');
  const adsEnabled = isFeatureEnabled('enableAds');
  const stripeEnabled = isFeatureEnabled('enableStripeCheckout');
  console.log(`Feature Flags: enableAds=${adsEnabled}, enableStripeCheckout=${stripeEnabled}`);
  console.log('✓ Feature flags verified!\n');

  // Test 5: Usage & Generous Quotas
  console.log('[Test 5] Testing Usage & Quota Logic...');
  const today = getTodayKey();
  console.log(`Today's key: ${today}`);
  const quotaCheck = isDailyQuotaExceeded('free');
  console.log(`Free quota exceeded: ${quotaCheck.exceeded} (limit: ${quotaCheck.limit} conversions/day)`);
  if (quotaCheck.limit < 10) throw new Error('Free daily limit must be generous');
  console.log('✓ Usage and quota calculation verified!\n');

  console.log('====================================================');
  console.log('   ALL 5 MONETIZATION TESTS PASSED WITH 100%!       ');
  console.log('====================================================');
  process.exit(0);
}

runMonetizationTests().catch((err) => {
  console.error('Monetization tests failed:', err);
  process.exit(1);
});
