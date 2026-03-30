import nodemailer from 'nodemailer';
import { generateMemorandoPDF } from './memorandoPdf.js';

export async function sendMailWithPdf(dados) {
    try {
        
        const pdfBuffer = await generateMemorandoPDF(dados);

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })

        return await transporter.sendMail({
            from: `"Sistema Movi Backend" <${process.env.EMAIL_USER}>`,
            to: 'matheusdemoraes2@gmail.com',
            subject: `Memorando: ${dados.assunto}`,
            text: dados.corpo,
            attachments: [
                {
                    filename: `memorando_${dados.nome}.pdf`,
                    content: pdfBuffer
                }
            ]
        })

    } catch (error) {
        console.error("Erro no sendMailWithPdf:", error);
        throw error;
    }
}