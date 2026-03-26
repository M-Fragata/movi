import { Router } from "express";
import { MemoController } from "../controller/Memo-Controller.js";

const memoRoutes = Router()
const memoController = new MemoController

memoRoutes.use("/", memoController.create)

export { memoRoutes }