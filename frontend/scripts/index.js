import { memoGemini } from "./memoGemini.js"
import { memorandosResult } from "./memorandosResult.js"

const button = document.querySelector('#format')
const textArea = document.querySelector('#message')
const loading = document.querySelector('#loading')
const memorandosSection = document.querySelector('#memorandosSection')
const encaminhamentosSection = document.querySelector('#encaminhamentosSection')
const emailsSection = document.querySelector('#emailsSection')

const hideAllSections = () => {
  memorandosSection.classList.add('hidden')
  encaminhamentosSection.classList.add('hidden')
  emailsSection.classList.add('hidden')
}

const setLoading = (state) => {
  if (state) {
    loading.classList.remove('hidden')
    button.disabled = true
  } else {
    loading.classList.add('hidden')
    button.disabled = false
  }
}

button.addEventListener('click', async () => {
  const userMessage = textArea.value.trim()
  if (!userMessage) return

  hideAllSections()
  setLoading(true)

  try {
    const result = await memoGemini(userMessage)
    console.log(result)
    memorandosResult(result)
  } catch (error) {
    console.error('Erro ao processar:', error)
  } finally {
    setLoading(false)
  }
})