
export default async function setupJS(webhandle) {

	webhandle.routers.preDynamic.use((req, res, next) => {
		let css = webhandle.development ? '/css/pages.css' : '/css/pages.min.css'
		let js = webhandle.development ? '/js/pages.js' : '/js/pages.min.js'
		res.locals.externalResourceManager.includeResource({
			mimeType: 'text/css'
			, url: css
		})
		res.locals.externalResourceManager.includeResource({
			mimeType: 'application/javascript'
			, url: js
			, attributes: {
				defer: null
			}
			, resourceType: 'module'
		})
		next()
	})

	webhandle.routers.preDynamic.use('/admin', async (req, res, next) => {
		await webhandle.pageServer.setupDataForPages(req, res)

		let css = webhandle.development ? '/css/app.css' : '/css/app.min.css'
		let js = webhandle.development ? '/js/app.js' : '/js/app.min.js'
		res.locals.externalResourceManager.includeResource({
			mimeType: 'text/css'
			, url: css
		})
		res.locals.externalResourceManager.includeResource({
			mimeType: 'application/javascript'
			, url: js
			, attributes: {
				defer: null
			}
			, resourceType: 'module'
		})

		next()
	})
}