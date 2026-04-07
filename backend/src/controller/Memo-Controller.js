import { GoogleGenAI } from "@google/genai"

import funcionarios from '../database/funcionarios.json' with { type: "json" }
import configBase from '../database/configBase.json' with { type: "json" }

const memoAI = new GoogleGenAI(process.env.GEMINI_API_KEY)

export class MemoController {

    async create(req, res) {

        try {
            const { userMessage, memoNumber, encaNumber } = req.body

            const memoPrompt = `
            Aja como um assistente especializado em gestão de pessoal. Processe o texto de movimentação que enviarei a seguir, seguindo rigorosamente estas diretrizes:

                1- Cruzamento de Dados (Matrícula):

                    Caso não seja informada a matrícula do funcionário, busque a matrícula de cada funcionário informado pelo usuário dentro do arquivo json ${JSON.stringify(funcionarios)} realizando o cruzamento pelo nome completo.

                    IMPORTANTE: Se o nome não for encontrado ou houver dúvida, deixe a coluna de matrícula em branco.

                2- Padronização e Mapeamento (EXCLUSIVIDADE DE LISTAS):

                    Você deve mapear as informações do texto para os termos exatos das listas fornecidas. Se o termo no texto for ligeiramente diferente, escolha o correspondente mais próximo SEMPRE dentro da lista correta:

                    - Campo 'destino': Use EXCLUSIVAMENTE a lista configBase.unidades ${JSON.stringify(configBase.unidades.map(u => u.nome))}, caso não seja encontrada a unidade escolar, retorne como "Não encontrada!".

                    - Campo 'cargo': Use EXCLUSIVAMENTE a lista configBase.cargos ${configBase.cargos}. Nunca use termos desta lista no campo de função.
                        * Se o texto diz "Instrutor Eixo IV Tecnologia", o cargo É "INSTRUTOR INTEGRADOR – EIXO 4 – TECNOLOGIA".
                        * NUNCA assuma "PROF DOCENTE I" a menos que esteja explícito no texto.
                        * 
                    - Campo 'funcao': Use EXCLUSIVAMENTE a lista configBase.funcoes ${configBase.funcoes}. Se o texto descrever uma função que se assemelha a um cargo, você DEVE encontrar o termo equivalente na lista de funções (ex: se o cargo for 'PROF DOCENTE I' e a função descrita for 'Tecnologia', use 'INST. TECNOLOGIA' da lista de funções).
                        * Para Instrutores de Tecnologia, a função É "INST. TECNOLOGIA".
                        * Para Instrutores de Esporte/Eixo III, a função É "INST. ATIV. ESPORTIVA".
                        * Para Orientadores, use "ORIENTADOR PEDAGÓGICO" (com acento, conforme a lista).

                    PROIBIÇÃO: Não invente cargos ou funções. Se não houver um mapeamento claro, deixe em branco.

                3- Lógica de Classificação (PRIORIDADE MÁXIMA):
                
                        - MEMORANDO: Quando o servidor entrar em uma unidade nova unidade escolar, ou seja, não possuia carga horaria na unidade de entrada.
                        - ENCAMINHAMENTO: Quando o servidor PERMANECE na unidade escolar e há apenas alteração de carga horária ou turno.
                        - REGRA DE DUPLICIDADE: Se o texto diz que o servidor atuará em DUAS escolas (ex: 24h em uma e 16h em outra), você deve analisar se são unidades escolares que o funcionario ja atuava e houve apenas alteração de carga horária ou se em alguma das duas unidades ele ja atuava para gerar encaminhamento, de qualquer forma será gerado dois registros, MEMORANDO para unidade nova e ENCAMINHAMENTO para unidade onde ele já estava.

                    REGRA DE OURO DA DUPLICIDADE:
                        Se o texto contiver a observação "o referido instrutor continuará a atuar na unidade [X] com carga horária de [Y]", você DEVE gerar DOIS registros:
                        - Um no array "memorandos" para a NOVA unidade (destino principal).
                        - Um no array "encaminhamentos" para a UNIDADE DE ORIGEM, com a carga horária residual [Y] e a observação correspondente.
                        * Se houver 7 servidores e 5 continuam em duas escolas, o JSON final deve ter 7 memorandos e 5 encaminhamentos.

                    Um objeto na lista de memorandos para a nova unidade.

                    Um objeto na lista de encaminhamentos para a unidade de origem, informando a carga horária que restou nela.
                    Se houver 5 funcionários nessa situação, a lista de encaminhamentos NÃO pode estar vazia.

                    Sempre que houver o termo 'continuará a atuar', o número do Memorando será X e o número do Encaminhamento será Y, referindo-se à mesma pessoa física.

                4- Formato das colunas:

                    - Memorandos: [Memorando (apenas o número), Expedição, início, matrícula, nome, cargo, função, situação (TRANSF), CÓD LOTAÇÃO, Destino, CARGA HORÁRIA (ex: 40 HORAS SEMANAIS), TURNO(MANHÃ(SE INFORMADO)/TARDE(SE INFORMADO)/INTEGRAL(CASO SEJA 40 HORAS SEMANAIS)/A COMBINAR(NA DÚVIDA DE QUAL SEJA)), OBSERVAÇÃO]
                    - Encaminhamentos: [Encaminhamento (apenas o número), Expedição, início, matrícula, nome, cargo, situação (TRANSF), CÓD LOTAÇÃO, Destino, CARGA HORÁRIA(ex: 40 HORAS SEMANAIS), TURNO(MANHÃ(SE INFORMADO)/TARDE(SE INFORMADO)/INTEGRAL(CASO SEJA 40 HORAS SEMANAIS)/A COMBINAR(NA DÚVIDA DE QUAL SEJA)), OBSERVAÇÃO]

                4.1 - PADRONIZAÇÃO DE DADOS:

                    - Nomes: Sempre em CAIXA ALTA.
                    - codLotacao: Se não houver um código numérico (ex: 123), deixe como "" (string vazia). Não repita o nome da escola aqui.
                    - Expedição: Data de hoje: ${new Date().toLocaleDateString('pt-BR')}.

                5- E-MAILS:

                    Gere os modelos de e-mail de Entrada e Saída,

                    exemplo de email de entrada para memorando: 

                        Assunto (Entrada - Nome do funcionário) corpo do email (Prezados, informamos que encaminhamos o(a) funcionário (nome) (matrícula) para atuar nesta unidade escolar a partir de (data de início) OBS.: Segue o memorando em anexo) 

                    exemplo de email de saída para memorando: 

                        Assunto (Saída - Nome do funcionário) corpo do email (Prezados, informamos que o(a) funcionário (nome) (matrícula) Não faz mais parte do quadro de funcionários desta unidade escolar a partir de (data de início na nova unidade)

                        O de encaminhamento só irá mudar que o funcionário não irá sair da unidade escolar, apenas alterar a quantidade de carga horária que deverá ser informada no corpo do email.

                6- Formato de Resposta:

                    Retorne estritamente o JSON. No campo 'funcao', certifique-se de que o valor venha da lista de 'funcoes' e não da lista de 'cargos'. Se não houver uma função clara, deixe o campo em branco, mas nunca preencha com um cargo. Siga rigorosamente o formato abaixo, preenchendo os campos conforme as diretrizes acima:
                        {
                            "memorandos": [
                            {
                                memorando: "",
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
                                encaminhamento: "",
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
                            "emails": [
                            {
                                "destino": (unidade de destino do servidor, utilize o nome da unidade de destino informado no campo destino do memorando/encaminhamento para definir o email, cruzando com a lista ${configBase.unidades[0].nome} para encontrar o email correspondente),
                                "email": (email da unidade escolar, com base no destino cruze o nome da unidade de destino com esta lista completa de objetos: ${JSON.stringify(configBase.unidades)} e extraia o campo "email" correspondente.
                                "tipo": "Entrada / Saída",
                                "funcionario": "NOME DO FUNCIONARIO",
                                "assunto": "Entrada / Saída - NOME DO FUNCIONARIO",
                                "corpo": "Prezados, informamos que..."
                            }
                            ]
                        }

                    TEXTO PARA PROCESSAR: ${userMessage} utilize a partir do número: ${memoNumber} para os memorandos e a partir do número: ${encaNumber} para os encaminhamentos.

                    Responda APENAS o objeto JSON, sem nenhum texto introdutório ou explicativo, e sem utilizar blocos de código (markdown code blocks), nunca retorne informação vazia, caso não seja encontrado retorne como "Não encontrado!".
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

            try {

                const jsonMatch = responseText.match(/\{[\s\S]*\}/)

                if (jsonMatch) {
                    const cleanJson = jsonMatch[0];
                    const jsonData = JSON.parse(cleanJson);
                    return res.status(200).json(jsonData);
                } else {
                    throw new Error("Nenhum JSON encontrado na resposta da IA.")
                }

            } catch (parseError) {
                console.error("Erro ao converter string da IA em JSON:", responseText);
                return res.status(500).json({
                    error: "A IA retornou um formato inválido.",
                    raw: responseText
                });
            }



        } catch (error) {
            console.error("Erro no processamento do GEMINI", error)
            return res.status(500).json({ error: "Erro interno do servidor ao processar o memorando." })
        }
    }
}
