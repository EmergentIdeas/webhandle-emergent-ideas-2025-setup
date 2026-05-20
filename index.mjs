#! /usr/local/bin/node
import inquirer from "inquirer"
import fs from "node:fs/promises"
import path from "node:path"
import { exec } from "node:child_process"

let info = {}
let packageInfo = {}
let result
let hasPackageFile = false

info.installerDir = import.meta.dirname
let cwd = info.projectDir = process.cwd()

let buildClientJSCommand
let buildLessCommand

function randomString(length = 8) {

	let result = ''
	while(result.length < length) {
		result += Math.random().toString(36).substring(2, 10);
	}
	
	return result.substring(0, length)
}

async function runCommand(command) {
	let p = new Promise((resolve, reject) => {
		exec(command, (err, stdout, stderr) => {
			if (err) {
				reject(err)
			}
			else {
				resolve({
					stdout, stderr
				})
			}
		})
	})
	return p
}

async function loadPackageFile(createOnFail = true) {
	hasPackageFile = false
	try {
		packageInfo = JSON.parse(await fs.readFile(path.join(info.projectDir, 'package.json')))
		hasPackageFile = true
	}
	catch (e) {
		if(createOnFail) {
			await runCommand('npm init -y')
			await loadPackageFile(false)
		}
	}
}
async function savePackageFile() {
	try {
		await fs.writeFile(path.join(info.projectDir, 'package.json'), JSON.stringify(packageInfo, null, '\t'))
		hasPackageFile = true
	}
	catch (e) {
		console.error(e)
	}
}

async function save(filename, content) {
	try {
		await fs.writeFile(path.join(info.projectDir, filename), content)
	}
	catch (e) {
		console.error(e)
	}
}
async function append(filename, content) {
	try {
		let txt = (await fs.readFile(path.join(info.projectDir, filename))).toString()
		await fs.writeFile(path.join(info.projectDir, filename), txt + content)
	}
	catch (e) {
		console.error(e)
	}
}
async function loadJson(filename) {
	try {
		return JSON.parse(await fs.readFile(path.join(info.projectDir, filename)))
	}
	catch (e) {
	}
	return {}
}
async function load(filename) {
	try {
		return await fs.readFile(path.join(info.projectDir, filename))
	}
	catch (e) {
		console.error(e)
	}
}

async function cpFromInstallToProject(sourceFile, destFile) {
	destFile ||= sourceFile
	let com = `cp -r ${path.join(info.installerDir, sourceFile)} ${path.join(info.projectDir, destFile)}`
	await runCommand(com)
}

async function mkdir(dir) {
	let com = `mkdir -p ${path.join(info.projectDir, dir)}`
	await runCommand(com)
}

async function install(pkg) {
	let com = `npm i ${pkg}`
	await runCommand(com)
	await loadPackageFile()
}

async function installDev(pkg) {
	let com = `npm i --save-dev ${pkg}`
	await runCommand(com)
	await loadPackageFile()
}

async function modConfigFile(filename, modifier) {
	let content = await loadJson(path.join('conf', filename))
	let ret = modifier(content)
	if(ret) {
		content = ret
	}
	await save(path.join('conf', filename), JSON.stringify(content, null, '\t'))
}

loadPackageFile()

result = await inquirer.prompt([
	{
		name: "projectDir",
		type: "input",
		message: "What is your project directory?",
		default: info.projectDir
	}
])
Object.assign(info, result)

if (info.projectDir != cwd) {
	process.chdir(info.projectDir)
}

result = await inquirer.prompt([
	{
		name: "projectName",
		type: "input",
		message: "What is your project name (no spaces, and not necessarily the package name)?"
	}
])
Object.assign(info, result)


result = await inquirer.prompt([
	{
		name: "packageName",
		type: "input",
		message: "What is your package name?",
		default: packageInfo.name || info.projectName
	}
])
Object.assign(info, result)

// Create a package file if we don't have one	
if (!hasPackageFile) {
	await runCommand('npm init -y')
	await loadPackageFile()
}

if(!packageInfo.scripts) {
	packageInfo.scripts = {}
}
packageInfo.name = info.packageName
packageInfo.type = 'module'
await savePackageFile()
await save('.gitignore', 'node_modules')
await cpFromInstallToProject('server-js')
await mkdir('views')

result = await inquirer.prompt([
	{
		name: "useLess",
		type: "confirm",
		message: "Do you want to set up LESS styles?"
	}
])
Object.assign(info, result)

if(info.useLess) {
	await mkdir('less')
	await cpFromInstallToProject('less/*', 'less')
	await mkdir('public/css')
	await installDev('less less-plugin-clean-css')
	let cmd = "npx lessc --source-map --source-map-include-source less/pages.less public/css/pages.css; npx lessc --source-map --source-map-include-source less/app.less public/css/app.css; "
	cmd += 'npx lessc --clean-css="--s1 --advanced --compatibility=ie8" less/pages.less public/css/pages.min.css; '
	cmd += 'npx lessc --clean-css="--s1 --advanced --compatibility=ie8" less/app.less public/css/app.min.css; '
	buildLessCommand = cmd
    packageInfo.scripts["less-build"] = cmd
	await savePackageFile()
	await append('less/pages.less', '\n@import "std-template-layouts";\n')
}


result = await inquirer.prompt([
	{
		name: "useWebpack",
		type: "confirm",
		message: "Do you want to set up WebPack to compile JS?"
	}
])
Object.assign(info, result)

if(info.useWebpack) {
	await mkdir('client-js')
	await cpFromInstallToProject('client-js/*', 'client-js')
	await cpFromInstallToProject('client-js.webpack.cjs')
	await cpFromInstallToProject('setups/js.mjs', 'server-js/setups/js.mjs')
	await mkdir('public/js')
	await installDev('webpack-cli')
	await installDev('@webhandle/webpack-text-loader')
	let cmd = buildClientJSCommand = "npx webpack-cli --config client-js.webpack.cjs"
    packageInfo.scripts["client-js-build"] = cmd
	await savePackageFile()
}

await mkdir('conf')
let adminPass = randomString(16)
await modConfigFile('dev.json', (content) => {
	content.port = 3000
	content.development = true
	content.initialAdministratorPassword = adminPass
})
await modConfigFile('prod.json', (content) => {
	content.port = 3000
	content.development = false
	content.initialAdministratorPassword = adminPass
})

result = await inquirer.prompt([
	{
		name: "setupMongoDb",
		type: "confirm",
		message: "Do you want to set up a MongoDB database?"
	}
])
Object.assign(info, result)
if(info.setupMongoDb) {
	result = await inquirer.prompt([
		{
			name: "host",
			type: "input",
			message: "Host",
			default: 'localhost'
		}
		, {
			name: "port",
			type: "number",
			message: "Port",
			default: 27017
		}
		, {
			name: "dbName",
			type: "input",
			message: "Database name",
			default: info.projectName.split(' ').join('')
		}
		, {
			name: "user",
			type: "input",
			message: "User"
		}
		, {
			name: "pass",
			type: "input",
			message: "Pass"
		}
	])
	
	let db = {
		type: 'mongodb'
		, dbName: result.dbName
		, url: `mongodb://${result.host}:${result.port}/`
		, collectionNames: []
		, user: result.user
		, pass: result.pass
	}
	
	await modConfigFile('dev.json', (content) => {
		if(!content.dbs) {
			content.dbs = []
		}
		content.dbs.push(db)
	})
	await modConfigFile('prod.json', (content) => {
		if(!content.dbs) {
			content.dbs = []
		}
		content.dbs.push(db)
	})
}

result = await inquirer.prompt([
	{
		name: "setupMail",
		type: "confirm",
		message: "Do you want to set up a mail configuration?"
	}
])
Object.assign(info, result)

if(info.setupMail) {

	result = await inquirer.prompt([
		{
			name: "host",
			type: "input",
			message: "Host"
		}
		, {
			name: "port",
			type: "number",
			message: "Port",
			default: 587
		}
		, {
			name: "user",
			type: "input",
			message: "User"
		}
		, {
			name: "pass",
			type: "input",
			message: "Pass"
		}
		, {
			name: "from",
			type: "input",
			message: "From email address"
		}
		, {
			name: "destDefault",
			type: "input",
			message: "Default destination email"
		}
		, {
			name: "grecaptchaPublic",
			type: "input",
			message: "Google recaptcha public key"
		}
		, {
			name: "grecaptchaPrivate",
			type: "input",
			message: "Google recaptcha private key"
		}
	])
	
	let mailParameters = {
		"@webhandle/mail-bridge": {
			"transport": {
				"host": "",
				"port": 587,
				"secure": false,
				"auth": {
					"user": "",
					"pass": ""
				}
			},
			"from": "",
			"destDefault": "",
			"grecaptchaPublic": "",
			"grecaptchaPrivate": ""
		}
	}
	
	mailParameters["@webhandle/mail-bridge"].transport.host = result.host
	mailParameters["@webhandle/mail-bridge"].transport.host = result.port
	mailParameters["@webhandle/mail-bridge"].transport.host = result.port
	mailParameters["@webhandle/mail-bridge"].transport.auth.user = result.user
	mailParameters["@webhandle/mail-bridge"].from = result.from
	mailParameters["@webhandle/mail-bridge"].destDefault = result.destDefault
	mailParameters["@webhandle/mail-bridge"].grecaptchaPublic = result.grecaptchaPublic
	mailParameters["@webhandle/mail-bridge"].grecaptchaPrivate = result.grecaptchaPrivate
	
	await modConfigFile('dev.json', (content) => {
		Object.assign(content, mailParameters)
	})
	await modConfigFile('prod.json', (content) => {
		Object.assign(content, mailParameters)
	})
	
	await cpFromInstallToProject('functional-views/mail-bridge', 'views')
	await cpFromInstallToProject('setups/mail-bridge.mjs', 'server-js/setups')

}

result = await inquirer.prompt([
	{
		name: "installUtilityTemplates",
		type: "confirm",
		message: "Do you want to install utility templates?"
	}
])
Object.assign(info, result)
if(info.installUtilityTemplates) {
	await install('@webhandle/utility-templates')
	await cpFromInstallToProject('setups/utility-templates.mjs', 'server-js/setups')
}

result = await inquirer.prompt([
	{
		name: "installBasicViews",
		type: "confirm",
		message: "Do you want to basic views, pages, and menus?"
	}
])
Object.assign(info, result)
if(info.installBasicViews) {
	await mkdir('views')
	await cpFromInstallToProject('functional-views/basic-views/*', 'views')
	await mkdir('pages')
	await mkdir('public/img')
	await cpFromInstallToProject('functional-views/basic-pages/*', 'pages')
	await cpFromInstallToProject('menus')
	await cpFromInstallToProject('less-secondary/std-template-layouts.less', 'less')
	await cpFromInstallToProject('js-secondary/pages-menu.mjs', 'client-js')
	await append('client-js/pages.mjs', '\nimport "./pages-menu.mjs";\n')
	await cpFromInstallToProject('setups/create-admin-user.mjs', 'server-js/setups')
}

result = await inquirer.prompt([
	{
		name: "installEI2025",
		type: "confirm",
		message: "Do you want to install @webhandle/emergent-ideas-2025?"
	}
])
Object.assign(info, result)
if(info.installEI2025) {
	await install('@webhandle/emergent-ideas-2025')
	await cpFromInstallToProject('server.mjs')
}

result = await inquirer.prompt([
	{
		name: "createPM2Scripts",
		type: "confirm",
		message: "Do you want to create pm2 scripts?"
	}
])
Object.assign(info, result)
if(info.createPM2Scripts) {
	await installDev('onchange')
let devConfig = `
let appName = '${info.projectName}'

module.exports = {
	apps: [
		{
			name: appName + '-dev-web',
			script: './server.mjs',
			node_args: ['--inspect'],
			"env": {
				webhandleConfigFile: 'conf/dev.json'
			}
		},
		{
			"name": appName + '-js-compile',
			"script": "npx webpack-cli --watch --config client-js.webpack.cjs",
		}
		, {
			"name": appName + '-dev-less-compile'
			, "script": "npx onchange 'less/**/*.less' -- npm run less-build"
		}
		, {
			"name": appName + '-dev-server-reload'
			, "script": "npx onchange 'server-js/**/*.mjs' -- pm2 reload " + appName + "-dev-web"
		}
	]
};

`
	save('dev.config.cjs', devConfig)
	let prodConfig = `
let appName = '${info.projectName}'

module.exports = {
	apps: [
		{
			name: appName + '-prod-web',
			script: './server.mjs',
			"env": {
				webhandleConfigFile: 'conf/prod.json'
			}
		}
	]
};
`
	save('prod.config.cjs', prodConfig)
}




if(buildClientJSCommand) {
	runCommand(buildClientJSCommand)
}
if(buildLessCommand) {
	runCommand(buildLessCommand)
}


console.log(info)