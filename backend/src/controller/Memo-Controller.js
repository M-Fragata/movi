import { GoogleGenAI } from "@google/genai"

import funcionarios from '../database/funcionarios.json' with { type: "json" }
import configBase from '../database/configBase.json' with { type: "json" }

const memoAI = new GoogleGenAI(process.env.GEMINI_API_KEY)

export class MemoController {

    async create(req, res) {

        try {
            const { userMessage } = req.body

            const memoPrompt = `
            Aja como um assistente especializado em gestão de pessoal. Processe o texto de movimentação que enviarei a seguir, seguindo rigorosamente estas diretrizes:

                1- Cruzamento de Dados (Matrícula):

                    Caso não seja informada a matrícula do funcionário, busque a matrícula de cada funcionário informado pelo usuário dentro do arquivo json ${JSON.stringify(funcionarios)} realizando o cruzamento pelo nome completo.

                    IMPORTANTE: Se o nome não for encontrado ou houver dúvida, deixe a coluna de matrícula em branco.

                2- Padronização (Config Base):

                    Utilize exclusivamente as nomenclaturas contidas no ${JSON.stringify(configBase)} para preencher as colunas de DESTINO, CARGO e FUNÇÃO.:

                3- Lógica de Classificação (PRIORIDADE MÁXIMA):
                
                        - MEMORANDO: Quando o servidor entrar em uma unidade nova unidade escolar, ou seja, não possuia carga horaria na unidade de entrada.
                        - ENCAMINHAMENTO: Quando o servidor PERMANECE na unidade escolar e há apenas alteração de carga horária ou turno.
                        - REGRA DE DUPLICIDADE: Se o texto diz que o servidor atuará em DUAS escolas (ex: 24h em uma e 16h em outra), você deve analisar se são unidades escolares que o funcionario ja atuava e houve apenas alteração de carga horária ou se em alguma das duas unidades ele ja atuava para gerar encaminhamento, de qualquer forma será gerado dois registros, MEMORANDO para unidade nova e ENCAMINHAMENTO para unidade onde ele já estava.

                4- Formato das colunas:

                    - Memorandos: [Expedição, início, matrícula, nome, cargo, função, situação (TRANSF), CÓD LOTAÇÃO, Destino, CARGA HORÁRIA, TURNO(MANHÃ(SE INFORMADO)/TARDE(SE INFORMADO)/INTEGRAL(CASO SEJA 40 HORAS SEMANAIS)/A COMBINAR(NA DÚVIDA DE QUAL SEJA)), OBSERVAÇÃO]
                    - Encaminhamentos: [Expedição, início, matrícula, nome, cargo, situação (TRANSF), CÓD LOTAÇÃO, Destino, CARGA HORÁRIA(ex: 40 HORAS SEMANAIS), TURNO(MANHÃ(SE INFORMADO)/TARDE(SE INFORMADO)/INTEGRAL(CASO SEJA 40 HORAS SEMANAIS)/A COMBINAR(NA DÚVIDA DE QUAL SEJA)), OBSERVAÇÃO]
                    - Expedição: Use a data de hoje: ${new Date().toLocaleDateString('pt-BR')}.

                5- E-MAILS:

                    Gere os modelos de e-mail de Entrada e Saída,

                    exemplo de email de entrada para memorando: 
                        Assunto (Entrada - Nome do funcionário) corpo do email (Prezados, informamos que encaminhamos o(a) funcionário (nome) (matrícula) para atuar nesta unidade escolar a partir de (data de início) OBS.: Segue o memorando em anexo) 
                    exemplo de email de saída para memorando: 
                        Assunto (Saída - Nome do funcionário) corpo do email (Prezados, informamos que o(a) funcionário (nome) (matrícula) Não faz mais parte do quadro de funcionários desta unidade escolar a partir de (data de início na nova unidade)

                        O de encaminhamento só irá mudar que o funcionário não irá sair da unidade escolar, apenas alterar a quantidade de carga horária que deverá ser informada no corpo do email.

                6- Formato de Resposta:

                    Retorne estritamente um objeto JSON com esta estrutura:

                        {
                            "memorandos": [
                            {
                                expedicao: "",
                                inicio: "",
                                matricula: "",
                                nome: "",
                                cargo: "",
                                funcao: "",
                                situacao: "",
                                codLotacao: "",
                                destino: "",
                                cargaHoraria: "",
                                turno: "",
                                observacao: ""
                            }
                            ],
                            "encaminhamentos": [
                            {
                                expedicao: "",
                                inicio: "",
                                matricula: "",
                                nome: "",
                                cargo: "",
                                situacao: "",
                                codLotacao: "",
                                destino: "",
                                cargaHoraria: "",
                                turno: "",
                                observacao: ""
                            }
                            ],
                            "emails": []
                        }

                    TEXTO PARA PROCESSAR: ${userMessage}
            `

            const response = await memoAI.models.generateContent({
                model: "gemini-3-flash-preview",
                generationConfig: {
                    responseMimeType: "application/json",
                },
                contents: [{
                    role: "user",
                    parts: [{ text: memoPrompt }]
                }]
            })

            const responseText = response.candidates[0].content.parts[0].text;

            let jsonData;

            try {
                // 2. Tente o parse direto primeiro (é o comportamento padrão desse modo)
                jsonData = JSON.parse(responseText);
            } catch (parseError) {
                // 3. Fallback apenas por segurança extrema
                const match = responseText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
                if (!match) throw parseError;
                jsonData = JSON.parse(match[0]);
            }

            return res.status(200).json(jsonData);

        } catch (error) {
            console.error("Erro no processamento do GEMINI", error)
            return res.status(500).json({ error: "Erro interno do servidor ao processar o memorando." })
        }
    }
}
