import gulp    from 'gulp';
import browser from 'browser-sync';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import notify from 'gulp-notify';
import notifier from 'node-notifier';
import { watch } from './index';


import { config as webpackConfig } from './webpack';

const bundler = webpack(webpackConfig);

export function server() {
	const config = {		
		server: 'dist',
		open: true,
		middleware: [
			webpackDevMiddleware(bundler, { /* options */ })
		]
	};
	browser.init(config);
	watch();
}

