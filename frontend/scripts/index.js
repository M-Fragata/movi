import { memoGemini } from "./memoGemini.js"

const button = document.querySelector('#format')
const textArea = document.querySelector('#message')

button.addEventListener('click', async () => {
    
    const userMessage = textArea.value

    const data = await memoGemini(userMessage)

    console.log(data)
})