export async function memoGemini(userMessage){

    try {
        
        const response = await fetch("http://localhost:3333/memorandos", {
            method: "POST",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify({message: userMessage})
        })

        if(!response.ok) {
            throw new Error("Erro na resposta do servidor")
        }

        const memorandos = await response.json()

        return memorandos

    } catch (error) {
        console.log("Erro ao conectar com o backend",error)
        alert("Não foi possível gerar memorandos")        
    }

}