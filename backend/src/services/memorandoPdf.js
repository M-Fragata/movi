import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateMemorandoPDF(dados) {

    //Brasão
    const logoPrefeituraPath = path.join(__dirname, 'assets', 'prefeitura.jpg')

    const logoPrefeituraBase64 = fs.readFileSync(logoPrefeituraPath).toString('base64');
    const logoPrefeitura = `data:image/jpeg;base64,${logoPrefeituraBase64}`;

    //Assinatura

    const logoAssinaturaPath = path.join(__dirname, 'assets', 'assinatura.png')

    const assinaturaBase64 = fs.readFileSync(logoAssinaturaPath).toString('base64');
    const logoAssinatura = `data:image/png;base64,${assinaturaBase64}`;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const ListFunc = dados.isBatch ? dados.itens : [dados]

    console.log(dados)

    let memorandoFormat = `
        <html>
            <head>
                <style>
                    @page { size: A4; margin: 2cm; }
                    body { 
                        font-family: 'Arial', sans-serif; 
                        font-size: 12pt; 
                        line-height: 1.5;
                        color: #000;
                    }
                    .container { 
                    margin-bottom: 20px; 
                    border: 1px solid #000; 
                    padding: 20px;
                    }
                    
                    /* Cabeçalho com Brasão */
                    .header-container { 
                        display: flex; 
                        align-items: center; 
                        margin-bottom: 30px;
                    }
                    .brasao { width: 80px; margin-right: 15px; }
                    .header-text { font-size: 11pt; }
                    .header-text p { margin: 0; }
                    .header-text .prefeitura { font-size: 13pt; font-weight: bold; }

                    /* Data à direita */
                    .date-line { text-align: right; margin-bottom: 40px; }

                    /* Identificação do documento */
                    .doc-id { font-weight: normal; margin-bottom: 20px; }
                    .destino { margin-bottom: 30px; }

                    /* Corpo do texto com recuo de parágrafo */
                    .text-body { 
                        text-align: justify; 
                        text-indent: 2cm; 
                        margin-bottom: 50px;
                    }

                    /* Assinatura Centralizada */
                    .signature-block { 
                        margin-top: 60px;
                        text-align: center; 
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .line { width: 300px; border-top: 1px solid black; margin-bottom: 5px; }
                    .signature-text { font-size: 10pt; text-transform: uppercase; line-height: 1.2; }

                    .obs { margin-top: 100px; font-size: 10pt; }
                    .page-break { page-break-after: always; }
                </style>
            </head>
            <body>
    `

    ListFunc.forEach((servidor, index) => {

        const tipoDoc = servidor.tipoDocumento === "Encaminhamento" ? "Encaminhamento" : "Memorando";

        memorandoFormat += `
            <div class="container">
                <div class="header-container">
                    <img class="brasao" src="${logoPrefeitura}" alt="Brasão Prefeitura de Maricá">
                    <div class="header-text">
                        <p class="prefeitura">Prefeitura Municipal de Maricá</p>
                        <p>Secretaria de Educação</p>
                        <p>Subsecretaria de Assuntos Institucionais</p>
                        <p>Coordenação de Movimentação Institucional</p>
                    </div>
                </div>

                <div class="date-line">
                    Maricá, ${servidor.expedicao || new Date().toLocaleDateString('pt-BR')}
                </div>

                <div class="doc-id">
                    ${tipoDoc} nº ${tipoDoc === "Encaminhamento" ? servidor.encaminhamento : servidor.memorando || '____'}/2026
                </div>


                <div class="destino">
                    Destino: <strong>${servidor.destino}</strong>
                </div>


                <p>Prezado(a),</p>

                <div class="text-body">
                    Pelo presente, encaminho a V. Sª, o(a) funcionário(a) <strong>${servidor.nome.toUpperCase()}</strong>, 
                    matrícula: <strong>${servidor.matricula}</strong>, para atuar neste local, a partir de ${servidor.inicio}, 
                    exercendo a função: <strong>${servidor.funcao || servidor.cargo}</strong>, 
                    com carga horária de ${servidor.cargaHoraria}.
                </div>

                <div class="signature-block">
                    ${logoAssinatura
                ? `<img src="${logoAssinatura}" alt="Assinatura" style="width: 260px; margin-bottom: 10px;">`
                : `
                                <div class="line"></div>
                                <div class="signature-text">
                        SUBSECRETÁRIA DE ASSUNTOS INSTITUCIONAIS<br>
                        <strong>SONIA MARIA DE ANDRADE FREIRE</strong><br>
                        MATRÍCULA 1649
                    </div>
                `
                }
                    

                </div>

            ${servidor.observacao ? `<div class="obs">Obs.: ${servidor.observacao}</div>` : ''}

            </div >
            `
        if (index < ListFunc.length - 1) {
            memorandoFormat += `< div class="page-break" ></div > `
        }
    })

    memorandoFormat += `</body ></html > `


    await page.setContent(memorandoFormat);
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', bottom: '0', left: '0', right: '0' }
    });

    await browser.close();
    return pdfBuffer;
}   