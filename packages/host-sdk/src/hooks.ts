// Thin React hooks over the registry. The SDK object is stable for the app
// lifetime, so these just read it; no state/subscription needed except for
// auth changes.
import {useEffect, useRef, useState} from 'react';
import type {HostSDK} from './types';
import {getHostSDK} from './registry';

/** The host SDK (stable reference). Throws if the host hasn't registered. */
export function useHostSDK(): HostSDK {
  const ref = useRef<HostSDK | null>(null);
  if (ref.current === null) {
    ref.current = getHostSDK();
  }
  return ref.current;
}

/** The host's authenticated Supabase client. */
export function useHostClient() {
  return useHostSDK().data.getClient();
}

/** Current user id, re-rendering when auth changes. */
export function useHostUserId(): string | null {
  const sdk = useHostSDK();
  const [userId, setUserId] = useState<string | null>(() =>
    sdk.auth.getUserId(),
  );
  useEffect(() => {
    return sdk.auth.onAuthChange(() => setUserId(sdk.auth.getUserId()));
  }, [sdk]);
  return userId;
}
