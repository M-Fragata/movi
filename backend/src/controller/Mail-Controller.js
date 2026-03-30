import { sendMailWithPdf } from "../services/mailService.js"

export class MailController {
    async sendMail(req, res) {
        try {
            
            const dados = req.body

            console.log("Enviando e-mail para o servidor:", dados.nome)

            await sendMailWithPdf(dados)

            return res.status(200).json({ message: 'E-mail enviado com sucesso!' })
        } catch (error) {
            console.error('Erro ao enviar e-mail:', error)
            return res.status(500).json({ message: 'Erro ao enviar e-mail.' })
        }
    }
}