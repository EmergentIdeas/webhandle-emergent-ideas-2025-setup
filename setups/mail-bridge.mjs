
export default async function setupMailBridge(webhandle) {

	let managerMailBridge = webhandle.componentManagers['@webhandle/mail-bridge']


	let handler = managerMailBridge.createFormHandler({
		to: managerMailBridge.config.destDefault
		, messageType: "user-contact"
		, emailTemplateName: 'mail-bridge/contact-email'
	})

	webhandle.routers.primary.post(['/contact'], handler)
}