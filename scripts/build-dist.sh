#!/usr/bin/env bash
# Build every FEDERATED MINI-APP for both platforms and stage the output under
# dist/<APP_VERSION>/ in the layout the host's ScriptManager expects:
#
#   dist/<version>/<mini-name>/ios/miniXxx.container.bundle (+ chunks/assets)
#   dist/<version>/<mini-name>/android/miniXxx.container.bundle (+ chunks/assets)
#
# The <version> segment namespaces bundles per host release so a given binary
# only loads minis built for it (see buildContainerUrl + APP_VERSION). For CDN
# delivery, publish dist/ to the CDN root → `<CDN>/<version>/<mini>/...`.
#
# Library packages (shared-ui, host-sdk) are SKIPPED: they have no
# rspack.config.mjs / federation container — they are bundled INTO each mini.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOST_APPVER_FILE="$ROOT/../grow-host-app/src/constants/appVersion.ts"

# Read APP_VERSION from the host's single source of truth (override with env).
APP_VERSION="${APP_VERSION:-$(grep -oE "APP_VERSION = '[^']+'" "$HOST_APPVER_FILE" | grep -oE "[0-9]+\.[0-9]+\.[0-9]+")}"
if [ -z "$APP_VERSION" ]; then
  echo "ERROR: could not determine APP_VERSION (set env APP_VERSION or check $HOST_APPVER_FILE)" >&2
  exit 1
fi

DIST="$ROOT/dist/$APP_VERSION"
echo "Staging mini-apps for host version $APP_VERSION → $DIST"

rm -rf "$ROOT/dist"
mkdir -p "$DIST"

for pkg_dir in "$ROOT"/packages/*/; do
  # Only federated mini-apps have an rspack.config.mjs; skip libraries.
  if [ ! -f "$pkg_dir/rspack.config.mjs" ]; then
    echo "── skip $(basename "$pkg_dir") (library, not a mini-app)"
    continue
  fi
  pkg_name=$(basename "$pkg_dir")
  echo ""
  echo "════ Building $pkg_name ════"

  for platform in ios android; do
    out_dir="$DIST/$pkg_name/$platform"
    mkdir -p "$out_dir"

    pnpm --filter "$pkg_name" exec react-native webpack-bundle \
      --platform "$platform" \
      --entry-file src/index.js \
      --dev false \
      --bundle-output "$out_dir/main.jsbundle" \
      --assets-dest "$out_dir"

    repack_out="$pkg_dir/build/generated/$platform"
    if [ -d "$repack_out" ]; then
      cp -R "$repack_out"/. "$out_dir/" 2>/dev/null || true
    fi

    echo "  ✓ $pkg_name/$platform → $out_dir"
  done
done

echo ""
echo "Done. Output staged at: $DIST"
echo "CDN delivery:   npx wrangler pages deploy $ROOT/dist --project-name grow-mini-apps"
echo "Embed in app:   (from grow-host-app) ./scripts/embed-mini-apps.sh"
