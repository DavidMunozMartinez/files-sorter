const path = require('path');
const ElectronReloadPlugin = require('webpack-electron-reload')({
  path: path.join(__dirname, './dist/main.js'),
});

module.exports = [
  {
    target: 'electron-main',
    entry: ['./src/main/main.ts', './src/main/event-handler.ts'],
    mode: 'development',
    externals: {
      fsevents: "require('fsevents')",
      "electron-reload": "require('electron-reload')"
    },
    mode: 'development',
    devtool: 'source-map',
    module: {
      rules: [{
        test: /\.ts$/,
        use: [{ loader: 'ts-loader' }]
      }]
    },
    output: {
      path: __dirname + '/dist',
      filename: 'main.js',
      devtoolModuleFilenameTemplate: '[absolute-resource-path]'
    },
    plugins: [
        ElectronReloadPlugin()
    ]
  },
  {
    target: 'web',
    entry: ['./src/render/app.ts', './src/render/styles.scss'],
    mode: 'development',
    devtool: 'source-map',
    externals: {
        'electron-titlebar': 'require("electron-titlebar")'
    },
    module: {
      rules: [{
        test: /\.ts$/,
        use: [{ loader: 'ts-loader' }]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ]
      }]
    },
    output: {
      path: __dirname + '/dist/app',
      filename: 'app.js'
    }
  }
];