'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')

// The var '__dirname' is 'build' dir.
/* path定义 */
const pagesPath = path.resolve(__dirname, "src/pages");

const name = defaultSettings.title || 'vue Element Admin' // page title

// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following method:
// port = 9527 npm run dev OR npm run dev --port = 9527
const port = process.env.port || process.env.npm_config_port || 9527 // dev port

module.exports = {
	publicPath: '/',
	outputDir: 'dist',
	assetsDir: 'static',
	filenameHashing: true,
	pages: getPages(pagesPath),
	lintOnSave: process.env.NODE_ENV === 'development',
	runtimeCompiler: false,
	productionSourceMap: false,

	devServer: {
		port: port,
		open: true,
		overlay: {
			warnings: false,
			errors: true
		},
		proxy: {
			// 设置代理解决本地调试服务器连接开发服务器的跨域问题，以及mock的模拟。
			// detail: https://cli.vuejs.org/config/#devserver-proxy 
			[process.env.VUE_APP_ADMIN_API]: {
				// target: `http://127.0.0.1:${port}/mock`, // `${process.env.VUE_APP_API_HOST}`, // 
				target: `${process.env.VUE_APP_API_HOST}`,
				changeOrigin: true,
				logLevel: 'debug',
				secure: false,
				pathRewrite: {
					'^/admin-dev': '/admin',
					'^/auth-dev': '/auth',
				}
			},
		},
		after: require('./mock/mock-server.js')
	},

	configureWebpack: {
		// provide the app's title in webpack's name field, so that
		// it can be accessed in index.html to inject the correct title.
		name: name,
		resolve: {
			alias: {
				'@': resolve('src')
			}
		}
	},


	chainWebpack(config) {
		//config.plugins.delete('preload') // TODO: need test
		// config.plugins.delete('prefetch') // TODO: need test

		// set svg-sprite-loader
		config.module
			.rule('svg')
			.exclude.add(resolve('src/icons'))
			.end()
		config.module
			.rule('icons')
			.test(/\.svg$/)
			.include.add(resolve('src/icons'))
			.end()
			.use('svg-sprite-loader')
			.loader('svg-sprite-loader')
			.options({
				symbolId: 'icon-[name]'
			})
			.end()

		// set preserveWhitespace
		config.module
			.rule('vue')
			.use('vue-loader')
			.loader('vue-loader')
			.tap(options => {
				options.compilerOptions.preserveWhitespace = true
				return options
			})
			.end()

		config
			// https://webpack.js.org/configuration/devtool/#development
			.when(process.env.NODE_ENV === 'development',
				config => config.devtool('cheap-source-map')
			)

		config
			.when(process.env.NODE_ENV !== 'development',
				config => {
					config
						.plugin('ScriptExtHtmlWebpackPlugin')
						.after('html')
						.use('script-ext-html-webpack-plugin', [{
							// `runtime` must same as runtimeChunk name. default is `runtime`
							inline: /runtime\..*\.js$/
						}])
						.end()
					config
						.optimization.splitChunks({
							chunks: 'all',
							cacheGroups: {
								libs: {
									name: 'chunk-libs',
									test: /[\\/]node_modules[\\/]/,
									priority: 10,
									chunks: 'initial' // only package third parties that are initially dependent
								},
								elementUI: {
									name: 'chunk-elementUI', // split elementUI into a single package
									priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
									test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
								},
								commons: {
									name: 'chunk-commons',
									test: resolve('src/components'), // can customize your rules
									minChunks: 3, //	minimum common number
									priority: 5,
									reuseExistingChunk: true
								}
							}
						})
					config.optimization.runtimeChunk('single')
				}
			)
	}

}


// 获取页面配置列表
function getPages(pagesPath) {
	const glob = require('glob');
	let pagesSrcPath = pagesPath + '/**/*.js';

	console.log(pagesSrcPath);

	let files = glob.sync(pagesSrcPath);
	let pages = {};
	let entryFileName;

	console.log(files);

	for (let i = 0; i < files.length; i++) {
		let matchs = /pages\/(\S*)_page.js/.exec(files[i]);
		console.log(matchs);
		if (matchs !== null) {
			entryFileName = matchs[1];
			if (/^_\w*/.test(entryFileName) || /\/_\w*/.test(entryFileName)) {
				continue;
			}

			let pageName = entryFileName;

			pages[entryFileName] = {
				entry: files[i],
				template: './src/public/index.html',
				filename: `${pageName}.html`,
				chunks: ['chunk-vendors', 'chunk-common', pageName]
			};
		}
	}

	//entry['app'] = './sass/admin/main.scss';

	console.log('> pages: ' + JSON.stringify(pages))
	return pages;
}

function resolve(dir) {
	return path.join(__dirname, dir)
}