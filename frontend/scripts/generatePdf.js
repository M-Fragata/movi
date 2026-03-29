export async function generatePdf(data) {
    try {
        
        const response = await fetch('http://localhost:3333/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        if(!response.ok){
            throw new Error('Erro ao gerar PDF')
        }

        const blob = await response.blob(); 

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        

        link.download = `memorando_${data.nome || 'documento'}.pdf`;
        
        document.body.appendChild(link);
        link.click();
        
        // Limpar a URL da memória após o download
        URL.revokeObjectURL(url);
        link.remove();

    } catch (error) {
        console.error('Erro ao gerar PDF:', error)
    }
}