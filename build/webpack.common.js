const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// entry
getEntry = () => {
    let entry = {
        fastClick: './src/assets/fastClick.js',
        index: './src/index.js'
    };
    glob.sync('./src/views/**/**.js').forEach(function (name) {
        let chunk_name = name.substring(name.lastIndexOf('/') + 1, name.lastIndexOf('.'));
        entry[chunk_name] = name;
    });
    return entry;
};

// html
getHtmlPlugins = () => {
    let htmlPlugin = [];
    glob.sync('./src/**/**.html').forEach(function (name) {
        let chunk_name = name.substring(name.lastIndexOf('/') + 1, name.lastIndexOf('.'));
        let filename;
        if (name === './src/index.html') {
            filename = '../index.html';
        } else {
            filename = name.replace('./src/views/', '../views/');
        }
        htmlPlugin.push(
            new HtmlWebpackPlugin({
                template: name,
                head: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="maximum-scale=1.0,minimum-scale=1.0,user-scalable=0,initial-scale=1.0,width=device-width"/><meta name="format-detection" content="telephone=no,email=no,date=no,address=no"><title>${chunk_name}</title></head><body>`,
                foot: `</body></html>`,
                chunks: ['fastClick', 'devRefreshBtn', 'vendor', 'commons', chunk_name],
                filename,
                alwaysWriteToDisk: true
            })
        );
    });
    return htmlPlugin;
};

module.exports = {
    entry: getEntry(),
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../dist/script'),
        library: '',
        libraryExport: 'default',
        libraryTarget: 'window'
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '../src/')
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                include: path.resolve(__dirname, 'src'),
                loader: "babel-loader?cacheDirectory"
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            config: {
                                path: './build/'
                            }
                        }
                    },
                    'sass-loader'
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'url-loader'
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist'], {
            root: path.resolve(__dirname, '..')
        }),
        new webpack.ProvidePlugin({
            Vue: ['@/assets/util.js', 'Profile'],
            app: ['@/assets/app.js', 'default'],
            req: ['@/config/req.js', 'default']
        }),
        ...getHtmlPlugins()
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    name: "commons",
                    chunks: "initial",
                    minChunks: 2,
                    minSize: 0
                },
                vendor: {
                    name: "vendor",
                    chunks: "all",
                    test: /[\\/]node_modules[\\/]/,
                    minChunks: 1,
                    maxInitialRequests: 5,
                    minSize: 0,
                    priority: 100
                }
            }
        }
    }
};