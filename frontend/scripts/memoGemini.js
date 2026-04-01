export async function memoGemini(userMessage, memoNumber, encaNumber){

    try {

        const response = await fetch("http://localhost:3333/memorandos", {
            method: "POST",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify({userMessage, memoNumber, encaNumber})
        })

        if(!response.ok) {
            throw new Error("Erro na resposta do servidor")
        }

        const memorandos = await response.json()
        console.log("Memorandos recebidos do backend:", memorandos)
        return memorandos

    } catch (error) {
        console.log("Erro ao conectar com o backend",error)
        alert("Não foi possível gerar memorandos")        
    }

}