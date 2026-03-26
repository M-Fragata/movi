import { Router } from 'express'
import { memoRoutes } from './memo-route.js'

const routes = Router()

routes.use("/memorandos", memoRoutes)

export { routes }