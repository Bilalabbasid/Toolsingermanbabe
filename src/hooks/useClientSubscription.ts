'use client';

import { useEffect, useState } from 'react';
import {
  getClientSubscription,
  initClientSubscription,
  type UserSubscription,
} from '@/lib/monetization/subscription';

/**
 * Keeps client components synchronized with the authenticated plan returned by
 * /api/v1/auth/me. A plain getClientSubscription() call only reads the current
 * snapshot and does not cause React to render again after hydration completes.
 */
export function useClientSubscription(): UserSubscription {
  const [subscription, setSubscription] = useState<UserSubscription>(() => getClientSubscription());

  useEffect(() => {
    const update = () => setSubscription(getClientSubscription());
    window.addEventListener('coolwave_subscription_changed', update);
    initClientSubscription();
    update();
    return () => window.removeEventListener('coolwave_subscription_changed', update);
  }, []);

  return subscription;
}
