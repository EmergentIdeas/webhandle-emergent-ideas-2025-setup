#! /usr/local/bin/node
import createEnvironment from '@webhandle/emergent-ideas-2025/create-environment.mjs';
import start from "./server-js/start.mjs"
let webhandle = await createEnvironment()
globalThis.webhandle = webhandle
await start(webhandle)

