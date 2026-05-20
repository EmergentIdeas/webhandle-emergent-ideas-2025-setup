const path = require('path');

 
let pagesBase = {
	entry: './client-js/pages.mjs',
	"devtool": 'source-map',
	experiments: {
		outputModule: true,
	},
	output: {
		filename: 'pages.js',
		path: path.resolve(__dirname, 'public/js'),
	},
	module: {
		rules: [
			{ test: /\.tmpl$/, use: '@webhandle/webpack-text-loader' }
			, { test: /\.tri$/, use: '@webhandle/webpack-text-loader' }
			, { test: /\.txt$/i, use: '@webhandle/webpack-text-loader' }
		],
	},
	resolve: {
		fallback: {
		}
	},
	plugins: [
    ]
	, externals: {
		"@webhandle/backbone-view": '@webhandle/backbone-view'
		, "tripartite": 'tripartite'
	}
}

let appBase = {
	entry: './client-js/app.mjs',
	"devtool": 'source-map',
	experiments: {
		outputModule: true,
	},
	output: {
		filename: 'app.js',
		path: path.resolve(__dirname, 'public/js'),
	},
	module: {
		rules: [
			{ test: /\.tmpl$/, use: '@webhandle/webpack-text-loader' }
			, { test: /\.tri$/, use: '@webhandle/webpack-text-loader' }
			, { test: /\.txt$/i, use: '@webhandle/webpack-text-loader' }
		],
	},
	resolve: {
		fallback: {
		}
	},
	plugins: [
    ]
	, externals: {
		"@webhandle/backbone-view": '@webhandle/backbone-view'
		, "tripartite": 'tripartite'
	}
}

let pagesDev = Object.assign({}, pagesBase, {
	mode: 'development'
	, output: {
		filename: 'pages.js',
		path: path.resolve(__dirname, 'public/js'),
	}
})
let pagesProd = Object.assign({}, pagesBase, {
	mode: 'production'
	, output: {
		filename: 'pages.min.js',
		path: path.resolve(__dirname, 'public/js'),
	}
})

let appDev = Object.assign({}, appBase, {
	mode: 'development'
	, output: {
		filename: 'app.js',
		path: path.resolve(__dirname, 'public/js'),
	}
})
let appProd = Object.assign({}, appBase, {
	mode: 'production'
	, output: {
		filename: 'app.min.js',
		path: path.resolve(__dirname, 'public/js'),
	}
})



module.exports = [
	pagesDev, pagesProd, appDev, appProd
]