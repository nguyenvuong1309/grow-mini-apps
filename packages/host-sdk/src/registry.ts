// Runtime registry: the host registers its SDK implementation once at boot;
// mini-apps read it. Stored on `globalThis` so it crosses bundle boundaries
// without a Module Federation import (Hermes-safe — see types.ts).
import type {HostSDK} from './types';
import {satisfies} from './version';

const GLOBAL_KEY = '__GROW_HOST_SDK__';

type GlobalWithSDK = typeof globalThis & {[GLOBAL_KEY]?: HostSDK};

/** Host calls this exactly once, early in boot, after store/supabase/nav exist. */
export function registerHostSDK(impl: HostSDK): void {
  (globalThis as GlobalWithSDK)[GLOBAL_KEY] = impl;
}

/** True once the host has registered. Use to guard early mini-app access. */
export function isHostSDKReady(): boolean {
  return !!(globalThis as GlobalWithSDK)[GLOBAL_KEY];
}

/**
 * Get the host SDK. Throws a clear error if the host has not registered yet —
 * which only happens if a mini-app touches it before `registerHostSDK()` runs,
 * i.e. a host boot-order bug.
 */
export function getHostSDK(): HostSDK {
  const sdk = (globalThis as GlobalWithSDK)[GLOBAL_KEY];
  if (!sdk) {
    throw new Error(
      '[@grow/host-sdk] Host SDK not registered. The host must call ' +
        'registerHostSDK() during boot before any mini-app mounts.',
    );
  }
  return sdk;
}

/**
 * Assert the registered SDK satisfies a semver range. Returns false (rather
 * than throwing) so mini-apps can degrade gracefully on an older host binary.
 */
export function requireHostSDK(range: string): HostSDK | null {
  if (!isHostSDKReady()) {
    return null;
  }
  const sdk = getHostSDK();
  return satisfies(sdk.version, range) ? sdk : null;
}
