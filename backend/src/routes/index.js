import { Router } from 'express'
import { memoRoutes } from './memo-route.js'
import { pdfRoutes } from './pdf-route.js'

const routes = Router()

routes.use("/memorandos", memoRoutes)
routes.use("/generate", pdfRoutes)

export { routes }