module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@screens': './src/screens',
            '@components': './src/components',
            '@navigation': './src/navigation',
            '@store': './src/store',
            '@services': './src/services',
            '@utils': './src/utils',
            '@hooks': './src/hooks',
            '@assets': './src/assets',
            '@constants': './src/constants',
            '@data': './src/data',
          },
        },
      ],
    ],
  };
};
