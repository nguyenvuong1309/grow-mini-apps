// The Host Platform SDK contract.
//
// This file is PURE TYPES — no implementation. The host bundle builds a
// concrete object satisfying `HostSDK` and registers it at runtime via
// `registerHostSDK()` (see registry.ts); federated mini-apps read that
// already-instantiated object via `getHostSDK()`.
//
// Why a runtime registry instead of a Module Federation import: importing a
// host module across the federation boundary re-evaluates it in the mini's
// chunk, which crashes Hermes on iOS production (EXC_BAD_ACCESS) and would
// create duplicate singletons (a second Supabase client, a second store...).
// Reading one host-provided object by reference avoids both: zero
// re-evaluation, exactly one instance.
import type {SupabaseClient} from '@supabase/supabase-js';
import type {Reducer, Action} from '@reduxjs/toolkit';

/** Saga generator function, kept loose to avoid pinning redux-saga internals. */
export type SagaFn = () => Iterator<unknown>;

/** Minimal navigation surface the host exposes to mini-apps. */
export interface HostNavigation {
  navigate(name: string, params?: object): void;
  goBack(): void;
  /** The host's navigation ref, for advanced cases (typed loosely on purpose). */
  getRef(): unknown;
}

export interface HostAuth {
  /** Current Supabase session, or null when signed out. */
  getSession(): unknown | null;
  /** Fresh access token (JWT) for authorizing requests. */
  getAccessToken(): Promise<string | null>;
  /** Current user id, or null when signed out. */
  getUserId(): string | null;
  /** Subscribe to auth changes; returns an unsubscribe function. */
  onAuthChange(cb: (session: unknown | null) => void): () => void;
}

export interface HostData {
  /**
   * The host's authenticated Supabase client — the SAME singleton instance the
   * host uses, returned by reference. Mini-app data layers call this instead of
   * importing `host/supabase` (which would re-evaluate and crash Hermes).
   */
  getClient(): SupabaseClient;
}

export interface HostStore {
  dispatch(action: Action | {type: string; payload?: unknown}): void;
  getState(): unknown;
  /**
   * Graft a mini-app's reducer into the host store at runtime. Idempotent:
   * a repeated key is a no-op. State becomes reachable at `state[key]`.
   */
  injectReducer(key: string, reducer: Reducer): void;
  /**
   * Run a mini-app's saga on the host saga middleware. Returns a cancel
   * function (call on unmount if the saga should not outlive the mini).
   */
  injectSaga(key: string, saga: SagaFn): () => void;
}

export interface HostEvents {
  emit(type: string, payload?: unknown): void;
  /** Subscribe to an event; returns an unsubscribe function. */
  on(type: string, cb: (payload: unknown) => void): () => void;
}

export interface HostStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

export interface HostAnalytics {
  track(event: string, props?: Record<string, unknown>): void;
}

export interface HostEnv {
  get(key: string): string | undefined;
  flag(name: string): boolean;
}

/**
 * The full capability surface the host exposes to federated mini-apps.
 * Versioned via `version` (semver) + `has()` for fine-grained negotiation.
 */
export interface HostSDK {
  /** Semver of the SDK the host implements. Minis check this before using. */
  readonly version: string;
  /** Fine-grained capability check, e.g. `has('data.getClient')`. */
  has(capability: string): boolean;

  auth: HostAuth;
  data: HostData;
  navigation: HostNavigation;
  store: HostStore;
  events: HostEvents;
  storage: HostStorage;
  analytics: HostAnalytics;
  env: HostEnv;
}
