import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as Repack from '@callstack/repack';
import {ReanimatedPlugin} from '@callstack/repack-plugin-reanimated';
import rspack from '@rspack/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// STANDALONE=true → mini app runs alone (eager shared deps, dev/test mode).
// STANDALONE=false (default) → mini app expects host to provide shared singletons.
const STANDALONE = process.env.STANDALONE === 'true';

export default Repack.defineRspackConfig(({mode, platform}) => {
  return {
    mode,
    context: __dirname,
    entry: './src/index.js',
    devServer: {
      port: 9001,
      host: '0.0.0.0',
    },
    output: {
      uniqueName: 'mini-squad-chat',
    },
    resolve: {
      ...Repack.getResolveOptions(),
      alias: {
        // Same optional-dep handling as the host (see host rspack.config.mjs).
        '@react-native-masked-view/masked-view': false,
      },
    },
    module: {
      rules: [
        {
          test: /\.[cm]?[jt]sx?$/,
          type: 'javascript/auto',
          use: {
            loader: '@callstack/repack/babel-swc-loader',
            options: {},
          },
        },
        ...Repack.getAssetTransformRules(),
      ],
    },
    plugins: [
      new Repack.RepackPlugin(),
      new ReanimatedPlugin({unstable_disableTransform: true}),

      // Stub Metro-specific APIs used by react-native-worklets
      new rspack.NormalModuleReplacementPlugin(
        /react-native-worklets.*metroOverrides/,
        path.resolve(
          __dirname,
          '../../../grow-host-app/stubs/empty.js',
        ),
      ),
      new rspack.NormalModuleReplacementPlugin(
        /@callstack\/repack\/.*getDevServerLocation/,
        path.resolve(
          __dirname,
          '../../../grow-host-app/stubs/getDevServerLocation.js',
        ),
      ),

      new Repack.plugins.ModuleFederationPlugin({
        name: 'miniSquadChat',
        filename: 'miniSquadChat.container.bundle',
        // The mini-app imports host modules (theme, store hooks, slices, etc.)
        // via `host/<name>`. At runtime these are resolved against the host
        // bundle which already declares them in its own `exposes`. The URL
        // here is a placeholder for the compile-time graph — the host bundle
        // itself isn't fetched (the host loads the mini, not the other way).
        remotes: {
          host: `host@http://localhost:8081/${platform}/host.container.bundle`,
        },
        exposes: {
          './SquadChatNavigator': './src/SquadChatNavigator',
        },
        // Versions MUST match what host declares as shared, otherwise the
        // singleton requirement will fail at runtime.
        shared: {
          react: {
            singleton: true,
            eager: STANDALONE,
            version: '19.2.3',
            requiredVersion: '19.2.3',
          },
          'react-native': {
            singleton: true,
            eager: STANDALONE,
            version: '0.84.1',
            requiredVersion: '0.84.1',
          },
          'react-native-reanimated': {
            singleton: true,
            eager: STANDALONE,
            version: '4.2.3',
            requiredVersion: '4.2.3',
          },
          'react-native-gesture-handler': {
            singleton: true,
            eager: STANDALONE,
            version: '2.30.0',
            requiredVersion: '2.30.0',
          },
          'react-native-screens': {
            singleton: true,
            eager: STANDALONE,
            version: '4.24.0',
            requiredVersion: '4.24.0',
          },
          'react-native-safe-area-context': {
            singleton: true,
            eager: STANDALONE,
            version: '5.5.2',
            requiredVersion: '5.5.2',
          },
          '@react-navigation/native': {
            singleton: true,
            eager: STANDALONE,
            version: '7.1.33',
            requiredVersion: '7.1.33',
          },
          '@react-navigation/native-stack': {
            singleton: true,
            eager: STANDALONE,
            version: '7.14.4',
            requiredVersion: '7.14.4',
          },
          'react-redux': {
            singleton: true,
            eager: STANDALONE,
            version: '9.2.0',
            requiredVersion: '9.2.0',
          },
          '@reduxjs/toolkit': {
            singleton: true,
            eager: STANDALONE,
            version: '2.11.2',
            requiredVersion: '2.11.2',
          },
          'redux-saga': {
            singleton: true,
            eager: STANDALONE,
            version: '1.4.2',
            requiredVersion: '1.4.2',
          },
          '@supabase/supabase-js': {
            singleton: true,
            eager: STANDALONE,
            version: '2.99.1',
            requiredVersion: '2.99.1',
          },
        },
      }),
    ],
  };
});
