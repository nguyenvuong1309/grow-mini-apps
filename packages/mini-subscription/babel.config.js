module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['babel-plugin-react-compiler', {target: '19'}],
    '@babel/plugin-transform-export-namespace-from',
    'react-native-worklets/plugin',
  ],
};
