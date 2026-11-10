import { spawn } from 'child_process'

/* What's happening here is that windows and pm2 has problems running files
	that are on the path but not absolutely specified or local to the directory.
	However, it will run a local js file just fine, so here we're taking the
	arguments passed and running them with spawn and the `shell` options, which
	does use the path
*/

async function run() {
	try {
		let commands = process.argv.slice(2)
		for (let command of commands) {
			await runCommand(command)
		}
	} catch (error) {
		console.error(`Error executing command: ${error.message}`);
	}
}

async function runCommand(command) {
	let parts = command.split(' ')
	let cmd = parts.shift()
	let args = parts.join(' ')
	parts = parameterize(args)
	return new Promise((resolve, reject) => {
		let proc = spawn(cmd, parts, {shell: true})
		proc.stdout.on('data', data => {
			console.log(data.toString())
		})
		proc.stderr.on('data', data => {
			console.error(data.toString())
		})
		proc.on('close', () => {
			resolve()
		})
		proc.on('err', err => {
			reject()
		})
	})
}

/** 
  * Break a string of parameters into an array of parameters.
  */
function parameterize(cmd) {
	const args = cmd.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)
		.map(arg => {
			// Remove the quote characters
			if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
				return arg.slice(1, -1);
			}
			return arg
		})
	return args
}


run()
