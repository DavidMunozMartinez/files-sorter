const path = require('path');

const ElectronReloadPlugin = require('webpack-electron-reload')({
    path: path.join(__dirname, './dist/main.js'),
});

const buildType = process.argv[2];
const mode = buildType == '--prod' ? 'production' : 'development';

const plugins = [];
// Only add this plugin when the --watch config is received
if (buildType == '--watch') {
    plugins.push(ElectronReloadPlugin());
}

const electronMain = {
    target: 'electron-main',
    entry: ['./src/main/main.ts'],
    node: {
        // Webpack overrides __dirname when compiling, we avoid this by setting
        // it to false here so it doesn't cause any problem when packaging the app
        __dirname: false
    },
    externals: {
        'fsevents': "require('fsevents')",
        'electron-reload': "require('electron-reload')"
    },
    mode: mode,
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
};

const electronReder = {
    target: 'electron-renderer',
    entry: ['./src/render/app.ts', './src/render/styles.scss'],
    mode: mode,
    devtool: 'source-map',
    externals: {
        'electron-titlebar': 'require("electron-titlebar")',
        'fsevents': "require('fsevents')",
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
            use: ['file-loader']
        },
        {
            test: /\.html$/i,
            loader: 'html-loader',
        }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.scss', '.css', '.html']
    },
    output: {
        path: __dirname + '/dist/app',
        filename: 'app.js'
    }
}

module.exports = [
    electronMain,
    electronReder
];