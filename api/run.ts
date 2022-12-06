// Entry point
import { app, host, port, msg } from './index'
app.listen(port, host, () => {
  console.log(msg)
})
