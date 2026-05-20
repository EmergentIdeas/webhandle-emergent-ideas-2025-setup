import fs from "node:fs/promises"
import path from "node:path"

export default async function start(webhandle) {

	let curDir = import.meta.dirname
	let files = await fs.readdir(path.join(curDir, 'setups'))
	files = files.filter(filename => filename.endsWith('.mjs'))
	
	for(let filename of files) {
		let mod = await import('./setups/' + filename)
		await mod.default(webhandle)
	}
	
	
	
	




	
	webhandle.routers.preDynamic.use('/menu', async (req, res, next) => {
		res.redirect('/admin/menu-administrators')
	})



}
