'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')

function resolve(dir) {
	return path.join(__dirname, dir)
}

if (process.env.NODE_ENV === 'development') {
	console.log('current envionment variables: ', process.env)
}

const name = defaultSettings.title || 'vue Element Admin' // page title

// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following method:
// port = 9527 npm run dev OR npm run dev --port = 9527
const port = process.env.port || process.env.npm_config_port || 9527 // dev port

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
	/**
	 * You will need to set publicPath if you plan to deploy your site under a sub path,
	 * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
	 * then publicPath should be set to "/bar/".
	 * In most cases please use '/' !!!
	 * Detail: https://cli.vuejs.org/config/#publicpath
	 */
	publicPath: (process.env.NODE_ENV === 'development' ? '/' : '/'),
	outputDir: 'dist',
	assetsDir: 'static',
	filenameHashing: true,
	// pages: getPages(pagesPath),
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
					'^/admin-dev': '/admin'
				}
			},
			[process.env.VUE_APP_AUTH_API]: {
				// target: `http://127.0.0.1:${port}/mock`, // `${process.env.VUE_APP_API_HOST}`, // 
				target: `${process.env.VUE_APP_API_HOST}`,
				changeOrigin: true,
				logLevel: 'debug',
				secure: false,
				pathRewrite: {
					'^/auth-dev': '/auth'
				}
			},
		},
		after: require('./mock/mock-server.js')
	},

	configureWebpack: config => {
		// provide the app's title in webpack's name field, so that
		// it can be accessed in index.html to inject the correct title.

		// ** 特别重要：没有这句配置，kekule加载时会出错，因为其中部分变量名字被压缩后将无法运行
		config.optimization.minimizer[0].options.terserOptions.mangle.reserved = ['$super', '$origin']

		return {
			name: name,
			resolve: {
				alias: {
					'@': resolve('src')
				}
			}
		}
	},

	chainWebpack(config) {
		// config.plugins.delete('preload') // TODO: need test
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
		config.module.rule('cur').test(/\.(cur|ico)$/).use('file-loader').loader('file-loader')

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
							maxSize: 4496000,
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
