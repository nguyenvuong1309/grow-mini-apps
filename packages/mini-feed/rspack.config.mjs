import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as Repack from '@callstack/repack';
import {ReanimatedPlugin} from '@callstack/repack-plugin-reanimated';
import rspack from '@rspack/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default Repack.defineRspackConfig(({mode, platform}) => {
  return {
    mode,
    context: __dirname,
    entry: './src/index.js',
    devServer: {
      port: 9003,
      host: '0.0.0.0',
    },
    output: {
      uniqueName: 'mini-feed',
    },
    resolve: {
      ...Repack.getResolveOptions(),
      alias: {
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

      new rspack.NormalModuleReplacementPlugin(
        /react-native-worklets.*metroOverrides/,
        path.resolve(__dirname, '../../../grow-host-app/stubs/empty.js'),
      ),
      new rspack.NormalModuleReplacementPlugin(
        /@callstack\/repack\/.*getDevServerLocation/,
        path.resolve(
          __dirname,
          '../../../grow-host-app/stubs/getDevServerLocation.js',
        ),
      ),

      new Repack.plugins.ModuleFederationPluginV2({
        name: 'miniFeed',
        filename: 'miniFeed.container.bundle',
        dts: false,
        exposes: {
          './FeedNavigator': './src/FeedNavigator',
        },
        // Foundational deps MUST be eager:true singletons. Lazy/non-eager
        // sharing causes Hermes EXC_BAD_ACCESS in iOS production builds.
        shared: {
          react: {
            singleton: true,
            eager: true,
            version: '19.2.3',
            requiredVersion: '19.2.3',
          },
          'react-native': {
            singleton: true,
            eager: true,
            version: '0.84.1',
            requiredVersion: '0.84.1',
          },
          'react-native-reanimated': {
            singleton: true,
            eager: true,
            version: '4.2.3',
            requiredVersion: '4.2.3',
          },
          'react-native-gesture-handler': {
            singleton: true,
            eager: true,
            version: '2.30.0',
            requiredVersion: '2.30.0',
          },
          'react-native-screens': {
            singleton: true,
            eager: true,
            version: '4.24.0',
            requiredVersion: '4.24.0',
          },
          'react-native-safe-area-context': {
            singleton: true,
            eager: true,
            version: '5.5.2',
            requiredVersion: '5.5.2',
          },
          'react-native-fast-image': {
            singleton: true,
            eager: true,
            version: '8.6.3',
            requiredVersion: '8.6.3',
          },
          'react-native-worklets': {
            singleton: true,
            eager: true,
            version: '0.8.1',
            requiredVersion: '0.8.1',
          },
          'react-native-nitro-modules': {
            singleton: true,
            eager: true,
            version: '0.35.0',
            requiredVersion: '0.35.0',
          },
          'react-native-mmkv': {
            singleton: true,
            eager: true,
            version: '4.2.0',
            requiredVersion: '4.2.0',
          },
          '@react-navigation/native': {
            singleton: true,
            eager: true,
            version: '7.1.33',
            requiredVersion: '7.1.33',
          },
          '@react-navigation/native-stack': {
            singleton: true,
            eager: true,
            version: '7.14.4',
            requiredVersion: '7.14.4',
          },
          'react-redux': {
            singleton: true,
            eager: true,
            version: '9.2.0',
            requiredVersion: '9.2.0',
          },
          '@reduxjs/toolkit': {
            singleton: true,
            eager: true,
            version: '2.11.2',
            requiredVersion: '2.11.2',
          },
          'redux-saga': {
            singleton: true,
            eager: true,
            version: '1.4.2',
            requiredVersion: '1.4.2',
          },
          '@supabase/supabase-js': {
            singleton: true,
            eager: true,
            version: '2.99.1',
            requiredVersion: '2.99.1',
          },
          // Workspace package. `requiredVersion: false` disables MF's semver
          // satisfaction check — otherwise it infers the requirement from
          // package.json's `workspace:*` (not valid semver) and rejects the
          // host-provided 1.0.0 singleton at runtime.
          '@grow/shared-ui': {
            singleton: true,
            eager: true,
            requiredVersion: false,
          },
        },
      }),
    ],
  };
});
