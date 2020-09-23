module.exports = [
  {
    target: 'electron-main',
    entry: ['./src/main/main.ts', './src/main/event-handler.ts'],
    externals: {
      fsevents: "require('fsevents')"
    },
    // mode: 'development',
    module: {
      rules: [{
        test: /\.ts$/,
        use: [{ loader: 'ts-loader' }]
      }]
    },
    output: {
      path: __dirname + '/dist',
      filename: 'main.js'
    }
  },
  {
    target: 'web',
    entry: ['./src/render/app.ts', './src/render/styles.scss'],
    mode: 'development',
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