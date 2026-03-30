import { Router } from 'express';
import { MailController } from '../controller/Mail-Controller.js';

const mailRoutes = Router();
const mailController = new MailController;

mailRoutes.post('/', mailController.sendMail);

export { mailRoutes}