// Entry point
import { server, host, port, msg } from './index'
server.listen(port, host, () => { console.log(msg) })
