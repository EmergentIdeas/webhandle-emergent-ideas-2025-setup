
export default async function(webhandle) {
	if(webhandle.config.initialAdministratorPassword && webhandle.services.authService && Object.keys(webhandle.dbs).length > 0) {
		await webhandle.services.authService.createUserIfNoneExists('administrator', webhandle.config.initialAdministratorPassword, ['administrators'])
	}
}