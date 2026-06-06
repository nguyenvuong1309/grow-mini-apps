import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as Repack from '@callstack/repack';
import {ReanimatedPlugin} from '@callstack/repack-plugin-reanimated';
import rspack from '@rspack/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STANDALONE = process.env.STANDALONE === 'true';

export default Repack.defineRspackConfig(({mode, platform}) => {
  return {
    mode,
    context: __dirname,
    entry: './src/index.js',
    devServer: {
      port: 9002,
      host: '0.0.0.0',
    },
    output: {
      uniqueName: 'mini-subscription',
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
        name: 'miniSubscription',
        filename: 'miniSubscription.container.bundle',
        dts: false,
        remotes: {
          host: `host@http://localhost:8081/${platform}/host.container.bundle`,
        },
        exposes: {
          './SubscriptionNavigator': './src/SubscriptionNavigator',
        },
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
          '@d11/react-native-fast-image': {
            singleton: true,
            eager: true,
            version: '8.13.0',
            requiredVersion: '8.13.0',
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
        },
      }),
    ],
  };
});
