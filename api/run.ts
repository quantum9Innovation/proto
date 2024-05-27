// Entry point
import { server, host, port, msg } from './index.js'
server.listen(port, host, () => { console.log(msg) })
