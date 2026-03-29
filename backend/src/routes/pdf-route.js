import { Router } from 'express';
import { GeneratePDFController } from "../controller/Pdf-Controller.js";
const pdfRoutes = Router();
const generatePDFController = new GeneratePDFController;

pdfRoutes.post('/', generatePDFController.create);

export { pdfRoutes };