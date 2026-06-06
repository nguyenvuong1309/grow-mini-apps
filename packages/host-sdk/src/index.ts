// @grow/host-sdk — the versioned capability contract between the Grow host
// shell and its federated mini-apps.
//
//   Host (once at boot):   registerHostSDK(buildHostSDK())
//   Mini (anywhere):       const sdk = getHostSDK(); sdk.data.getClient() ...
//
// See types.ts for the full surface and the rationale for the runtime registry.

export type {
  HostSDK,
  HostAuth,
  HostData,
  HostNavigation,
  HostStore,
  HostEvents,
  HostStorage,
  HostAnalytics,
  HostEnv,
  SagaFn,
} from './types';

export {
  registerHostSDK,
  getHostSDK,
  isHostSDKReady,
  requireHostSDK,
} from './registry';

export {SDK_VERSION, satisfies} from './version';

export {useHostSDK, useHostClient, useHostUserId} from './hooks';
