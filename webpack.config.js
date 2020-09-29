const path = require('path');
const ElectronReloadPlugin = require('webpack-electron-reload')({
  path: path.join(__dirname, './dist/main.js'),
});

// Remove this plugin for the build process to avoid automatically running the app
// when we just want to run the build after the npm install
const plugins = process.argv[2] == '--build' ? [] : [ElectronReloadPlugin()];

module.exports = [{
    target: 'electron-main',
    entry: ['./src/main/main.ts'],
    externals: {
      fsevents: "require('fsevents')",
      "electron-reload": "require('electron-reload')"
    },
    mode: 'development',
    devtool: 'source-map',
    module: {
      rules: [{
        test: /\.ts$/,
        use: [{
          loader: 'ts-loader'
        }]
      }]
    },
    output: {
      path: __dirname + '/dist',
      filename: 'main.js',
    },
    plugins: plugins
  },
  {
    target: 'electron-renderer',
    entry: ['./src/render/app.ts', './src/render/styles.scss'],
    mode: 'development',
    devtool: 'source-map',
    externals: {
      'electron-titlebar': 'require("electron-titlebar")',
      fsevents: "require('fsevents')",
    },
    module: {
      rules: [{
          test: /\.ts$/,
          use: [{
            loader: 'ts-loader'
          }]
        },
        {
          test: /\.scss$/i,
          use: [
            // Creates `style` nodes from JS strings
            'style-loader',
            // Translates CSS into CommonJS
            'css-loader',
            // Compiles Sass to CSS
            'sass-loader',
          ]
        },
        {
          test: /\.(ttf|eot|svg|gif|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: [{
            loader: 'file-loader',
          }]
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    output: {
      path: __dirname + '/dist/app',
      filename: 'app.js'
    }
  }
];