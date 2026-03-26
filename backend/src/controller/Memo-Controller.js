import { GoogleGenerativeAI } from "@google/generative-ai"

const memoAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const model = memoAI.getGenerativeModel({ model: "gemini-3-flash-preview" })

export class MemoController {

    async create(req, res) {

        try {

            const { userMessage } = req.body

            const memoPrompt = `
                Aja como um assistente especializado em gestão de pessoal. Processe o texto de movimentação que enviarei a seguir, seguindo rigorosamente estas diretrizes:

                1- Cruzamento de Dados (Matrícula):

                    Caso não seja informada a matrícula do funcionário, busque a matrícula de cada servidor na aba "FUNCIONARIOS" realizando o cruzamento pelo nome completo.

                    IMPORTANTE: Se o nome não for encontrado ou houver dúvida, deixe a coluna de matrícula em branco.

                2- Padronização (Config Base):

                    Utilize exclusivamente as nomenclaturas contidas na aba "CONFIG BASE" para:

                    Nomes das Unidades Escolares.

                    Nomes dos Cargos.

                    Descrição das Funções.

                3- Lógica de Classificação (Regra de Encaminhamento):

                    Encaminhamento: Se o servidor permanecer na unidade escolar e houver apenas alteração de carga horária (ex: o servidor já atuava na escola e está apenas aumentando ou diminuindo as horas nela), classifique como ENCAMINHAMENTO e registre na aba "ENCAMINHAMENTO FORMATO".

                    Memorando: Se for uma entrada em uma unidade nova ou saída total de uma unidade anterior, classifique como MEMORANDO e registre na aba "MEMORANDO FORMATO".

                4- Saídas Esperadas:

                    Tabela 1: Preencha os dados no formato exato da aba "MEMORANDO FORMATO" (incluindo colunas como MEMO, EXPEDIÇÃO, INÍCIO, MATRÍCULA, NOME, CARGO, FUNÇÃO, SITUAÇÃO, CÓD LOTAÇÃO, DESTINO, CARGA HORÁRIA, TURNO e OBSERVAÇÃO).

                    Tabela 2: Preencha os dados no formato exato da aba "ENCAMINHAMENTO FORMATO".

                    E-mails: Gere os modelos de e-mail de Entrada e Saída, adaptando o texto conforme o caso (se é uma apresentação de novo servidor ou uma comunicação de alteração de carga horária/permanência).

                ${userMessage}
            `

            const result = await model.generateContent(memoPrompt)

            const responseText = result.response.text()

            return res.status(200).json({
                message: "Processamento concluído",
                data: responseText
            })

        } catch (error) {
            console.error("Erro no processamento do GEMINI", error)
            return res.status(500).json({error: "Erro interno do servidor ao processar o memorando."})
        }

    }

}