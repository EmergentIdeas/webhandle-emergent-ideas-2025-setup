import setupTemplates from "@webhandle/utility-templates/initialize-webhandle-component.mjs"
import { escAttr } from "@webhandle/utility-templates/template-functions.mjs"


export default async function addTemplates(webhandle) {
	await setupTemplates(webhandle)

	webhandle.addTemplate('currentYear', () => {
		return ((new Date().getFullYear()) + '')
	})

	webhandle.addTemplate('returnToBr', (data) => {
		data ||= ''
		return data.split('\n').join('<br>')
	})
	webhandle.addTemplate('returnToSpace', (data) => {
		data ||= ''
		return escAttr(data.split('\n').join(' '))
	})


}