const webpack           = require('webpack');
const path              = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");

// css minifier
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// js minifier
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

// images optimizations
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const imageminGifsicle = require('imagemin-gifsicle');

module.exports = {
    // base source path
    context: path.resolve(__dirname, 'src'),

    // entry file names to compile
    entry: {
        main: './scripts/main.js'
    },

    // compiled files path
    output: {
        filename: "scripts/script.js",
        path: path.resolve(__dirname, 'assets'),
        publicPath: "../"
    },

    // live process assets
    watch: true,

    // enable source maps
    devtool: 'inline-source-map',

    // directory for starting webpack dev server
    devServer: {
        contentBase: './'
    },
    // modules
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                url: false
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                url: false,
                            },
                        },
                    ],
                })
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                url: false
                            }
                        }
                    ],
                })
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.(png|jpe?g|gif)$/,
                loaders: [{
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]'
                    },
                }, ]
            },
            {
                test: /\.svg$/,
                loader: 'svg-url-loader',
            },
        ]
    },
    // connect other plugins
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/index.html',
            filename: './templates/index.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/404.html',
            filename: './templates/404.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/about.html',
            filename: './templates/about.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/cart.html',
            filename: './templates/cart.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/catalogue-category.html',
            filename: './templates/catalogue-category.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/catalogue-item-inner.html',
            filename: './templates/catalogue-item-inner.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/catalogue-items-grid.html',
            filename: './templates/catalogue-items-grid.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/catalogue-items-list.html',
            filename: './templates/catalogue-items-list.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/catalogue.html',
            filename: './templates/catalogue.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/checkout.html',
            filename: './templates/checkout.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/constructor.html',
            filename: './templates/constructor.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/contacts.html',
            filename: './templates/contacts.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/default-page.html',
            filename: './templates/default-page.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/employees.html',
            filename: './templates/employees.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/fast-service.html',
            filename: './templates/fast-service.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/news-inner.html',
            filename: './templates/news-inner.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/news.html',
            filename: './templates/news.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/ordered.html',
            filename: './templates/ordered.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/search.html',
            filename: './templates/search.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/sertificates.html',
            filename: './templates/sertificates.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/services-inner.html',
            filename: './templates/services-inner.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/services.html',
            filename: './templates/services.html'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './templates/vacancy.html',
            filename: './templates/vacancy.html'
        }),
        new ExtractTextPlugin({
            filename: 'css/main.css'
        }),
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css$/g,
            cssProcessor: require('cssnano'),
            cssProcessorOptions: {
                discardComments: {
                    removeAll: true
                }
            },
            canPrint: true
        }),
        new CompressionPlugin({
            asset: "[path].gz[query]",
            algorithm: "gzip",
            test: /\.js$|\.css$|\.html$/,
            threshold: 0,
            minRatio: 0
        }),
        new CopyWebpackPlugin([{
            from: './fonts/',
            to: 'fonts/'
        }]),
        new CopyWebpackPlugin([{
            from: './images/',
            to: 'images/'
        }]),
        new ImageminPlugin({
            plugins: [
                imageminMozjpeg({
                    quality: 50,
                    progressive: true
                }),
                imageminPngquant({
                    floyd: 0.5,
                    speed: 2
                }),
                imageminSvgo({
                    plugins: [{
                            removeViewBox: false
                        },
                        {
                            removeTitle: true
                        },
                        {
                            convertPathData: false
                        }
                    ]
                }),
                imageminGifsicle({
                    interlaced: false
                }),
            ]
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            jquery: "jquery"
        }),
    ],
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    mangle: {
                        properties: {}
                    },
                    output: {
                        comments: false,
                        beautify: false,
                    },
                    toplevel: true,
                    nameCache: null,
                }
            })
        ]
    },
};