// SDK version + a tiny semver range checker (no dependency on `semver`, which
// is blocked by the host's pnpm trust policy and is overkill here).

/** The SDK contract version this package describes. Bump on contract changes. */
export const SDK_VERSION = '1.0.0';

function parse(v: string): [number, number, number] {
  const [maj = 0, min = 0, patch = 0] = v
    .replace(/^[^\d]*/, '')
    .split('.')
    .map(n => parseInt(n, 10) || 0);
  return [maj, min, patch];
}

/**
 * Minimal range check supporting the forms mini-apps actually need:
 *   '1.2.3'  exact
 *   '>=1.2.0' at least
 *   '^1.2.0'  same major, >= minor.patch
 *   '*'       any
 * Returns true if `actual` satisfies `range`.
 */
export function satisfies(actual: string, range: string): boolean {
  if (range === '*' || range.trim() === '') {
    return true;
  }
  const a = parse(actual);
  if (range.startsWith('>=')) {
    return cmp(a, parse(range.slice(2))) >= 0;
  }
  if (range.startsWith('^')) {
    const r = parse(range.slice(1));
    return a[0] === r[0] && cmp(a, r) >= 0;
  }
  return cmp(a, parse(range)) === 0;
}

function cmp(a: [number, number, number], b: [number, number, number]): number {
  // Fixed indices (not a dynamic loop) so this stays clean under the host's
  // `noUncheckedIndexedAccess` tsconfig.
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}
