import { generateMemorandoPDF } from "../services/memorandoPdf.js"

export class GeneratePDFController {
    async create(req, res) {
        try {
            
            const data = req.body
            const pdfBuffer = await generateMemorandoPDF(data)

            const filename = data.isBatch ? "Lote_Memorandos" : `Memorando_${data.nome || 'documento'}`

            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`)
            
            return res.status(200).send(pdfBuffer)

        } catch (error) {
            console.error('Erro no Controller de PDF:', error)
            return res.status(500).json({ error: 'Erro ao gerar PDF' })
        }
    }
}