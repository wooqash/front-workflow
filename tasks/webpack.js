import path    from 'path';
import webpack from 'webpack';
import process from 'process';
import browser from 'browser-sync';

const isProduction = process.env.NODE_ENV ? process.env.NODE_ENV.trim() === "production" : false;


let dirs = {
    src: path.resolve(__dirname, '../src'),
    dist: path.resolve(__dirname, '../dist')
};


let config = {
    devtool: !isProduction ? 'cheap-module-eval-source-map' : '',
    entry: './js/main.js',

    output: {
        filename: './js/bundle.js',
        path: dirs.dist
    },

    context: dirs.src,

    plugins: isProduction ? [ new webpack.optimize.UglifyJsPlugin() ] : []
};


function scripts() {

    return new Promise(resolve => webpack(config, (err, stats) => {

        if(err) console.log('Webpack', err)

        console.log(stats.toString({ /* stats options */ }))

        resolve(browser.reload({stream: true}))
    }))
}

module.exports = { config, scripts }
