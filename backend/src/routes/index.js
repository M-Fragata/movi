import { Router } from 'express'
import { memoRoutes } from './memo-route.js'
import { pdfRoutes } from './pdf-route.js'
import { mailRoutes } from './mail-route.js'

const routes = Router()

routes.use("/memorandos", memoRoutes)
routes.use("/generate", pdfRoutes)
routes.use("/sendmail", mailRoutes)

export { routes }