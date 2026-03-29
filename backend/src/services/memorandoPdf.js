import puppeteer from 'puppeteer';

export async function generateMemorandoPDF(dados) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const ListFunc = dados.isBatch ? dados.itens : [dados]

    console.log(dados)

    let memorandoFormat = `
        <html>
            <head>
                <style>
                    body { font-family: Arial; padding: 50px; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
                    .content { margin-top: 30px; line-height: 1.6; }
                    .footer { margin-top: 100px; text-align: center; }
                    /* Regra crucial para o PDF separar as páginas corretamente */
                    .page-break { page-break-after: always; }
                </style>
            </head>
            <body>
    `

    ListFunc.forEach((servidor, index) => {
        memorandoFormat += `
                <div class="container">
                <div class="header">
                    <h2>PREFEITURA DE MARICÁ</h2>
                    <h3>Secretaria Municipal de Educação</h3>
                </div>
                <div class="content">
                    <p>${servidor.expedicao}</p>
                    <p>MEMORANDO Nº ____/2026</p>
                    <p>Destino: ${servidor.destino}</p>
                    <p>Prezado(a),</p>
                    <p>Pelo presente, encaminhamo a V.Sª o(a) funcionário(a) <strong>${servidor.nome}</strong>, 
                    matrícula <strong>${servidor.matricula}</strong>, para atuar na unidade, a partir de ${servidor.inicio}, exercendo a função de ${servidor.funcao}, com carga horária de ${servidor.cargaHoraria}.</p> 
                    
                    <p>${servidor.observacao ? `Obs.: ${servidor.observacao}` : ''}</p>
                </div>
                <div class="footer">
                    <p>__________________________________________</p>
                    <p>Assinatura do Coordenador</p>
                </div>
            </div>
        `
        if (index < ListFunc.length - 1) {
            memorandoFormat += `<div class="page-break"></div>`
        }
    })

    memorandoFormat += `</body></html>`


    await page.setContent(memorandoFormat);
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });

    await browser.close();
    return pdfBuffer;
}   