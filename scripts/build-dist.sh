#!/usr/bin/env bash
# Build every mini-app for both platforms and stage the output under dist/
# in the layout the host's ScriptManager expects:
#
#   dist/<mini-name>/ios/miniXxx.container.bundle (+ chunks/assets)
#   dist/<mini-name>/android/miniXxx.container.bundle (+ chunks/assets)
#
# That `dist/` directory is published to Cloudflare Pages as-is, so a URL
# like https://<project>.pages.dev/mini-squad-chat/ios/miniSquadChat.container.bundle
# resolves directly to a file.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT/dist"

rm -rf "$DIST"
mkdir -p "$DIST"

for pkg_dir in "$ROOT"/packages/*/; do
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

    # Re.Pack's ModuleFederationPlugin emits the container bundle into the
    # mini-app's build/generated/<platform>/ folder. Mirror everything from
    # there into dist so chunks + assets stay siblings of the container file.
    repack_out="$pkg_dir/build/generated/$platform"
    if [ -d "$repack_out" ]; then
      cp -R "$repack_out"/. "$out_dir/" 2>/dev/null || true
    fi

    echo "  ✓ $pkg_name/$platform → $out_dir"
  done
done

echo ""
echo "Done. Output staged at: $DIST"
echo "Publish to Cloudflare Pages with:"
echo "  npx wrangler pages deploy dist --project-name grow-mini-apps"
