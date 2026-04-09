import nodemailer from 'nodemailer';
import { generateMemorandoPDF } from './memorandoPdf.js';

export async function sendMailWithPdf(dados) {
    try {

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })

        let attachment = []

        if (dados.tipo !== 'Saída') {

            const pdfBuffer = await generateMemorandoPDF(dados);

            attachment = [{
                filename: `memorando_${dados.nome}.pdf`,
                content: pdfBuffer
            }]
        }

        return await transporter.sendMail({
            from: `"Movimentação Institucional" <${process.env.EMAIL_USER}>`,
            to: `${dados.email}`,
            cc: [
                "rheducacao@educ.marica.rj.gov.br",
                "subensino2025@educ.marica.rj.gov.br"
            ],
            subject: `Memorando: ${dados.assunto}`,
            text: dados.corpo,
            attachments: attachment
        })

    } catch (error) {
        console.error("Erro no sendMailWithPdf:", error);
        throw error;
    }
}