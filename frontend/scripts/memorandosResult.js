import { generatePdf } from "./generatePdf.js"

const memorandosList = document.querySelector('#memorandosList')
const encaminhamentosList = document.querySelector('#encaminhamentosList')
const emailsList = document.querySelector('#emailsList')
const memorandosSection = document.querySelector('#memorandosSection')
const encaminhamentosSection = document.querySelector('#encaminhamentosSection')
const emailsSection = document.querySelector('#emailsSection')


const formatObjectToText = (obj) => {
  if (typeof obj !== 'object' || obj === null) return String(obj)
  return Object.entries(obj)
    .filter(([k,v]) => v !== undefined && v !== null && String(v).trim() !== '')
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')
}

const sheetHeadersMemorando = ['Expedição','Início','Matrícula','Nome','Cargo','Função','Situação','Cód Lotação','Destino','Carga Horária','Turno','Observação','pdf']
const sheetHeadersEncaminhamento = ['Expedição','Início','Matrícula','Nome','Cargo','Situação','Cód Lotação','Destino','Carga Horária','Turno','Observação','pdf']

const normalizeKey = (object, targetKey) => {
  const normalizeString = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '').toLowerCase()
  const normalizedTarget = normalizeString(targetKey)
  const found = Object.keys(object).find(k => normalizeString(k) === normalizedTarget)
  return found || null
}

const getTodayDate = () => {
  const today = new Date()
  return today.toLocaleDateString('pt-BR')
}

const createSpreadsheet = (container, items, sectionName) => {
  container.innerHTML = ''

  const wrapper = document.createElement('div')
  wrapper.className = 'table-wrapper'

  const btnCopyAll = document.createElement('button')
  btnCopyAll.className = 'copy-all-btn'
  btnCopyAll.type = 'button'
  btnCopyAll.textContent = 'Copiar Todos'

    btnCopyAll.addEventListener('click', async () => {
    try {
      let tableText = ''
      Array.from(tbody.rows).forEach(row => {
        const rowText = Array.from(row.cells).map(cell => cell.textContent).join('\t')
        tableText += rowText + '\n'
      })

      await navigator.clipboard.writeText(tableText)
      btnCopyAll.textContent = 'Copiado!'
      btnCopyAll.classList.add('copied')
      setTimeout(() => {
        btnCopyAll.textContent = 'Copiar Todos'
        btnCopyAll.classList.remove('copied')
      }, 1400)
    } catch (err) {
      console.error('Erro ao copiar:', err)
      btnCopyAll.textContent = 'Erro'
      setTimeout(() => {
        btnCopyAll.textContent = 'Copiar Todos'
      }, 1400)
    }
  })


  const btnDownloadAll = document.createElement('button')
  btnDownloadAll.className = 'download-all-btn'
  btnDownloadAll.type = 'button'
  btnDownloadAll.textContent = 'Gerar PDFs'

    btnDownloadAll.addEventListener('click', async () => {
      try {
        
        const batchData = {
          isBatch: true,
          tipo: sectionName,
          itens: items
        }

        await generatePdf(batchData)

      } catch (error) {
        console.error('Erro ao gerar PDFs:', error)
      }
    })


  const table = document.createElement('table')
  table.className = 'sheet-table'

  const thead = table.createTHead()
  const headRow = thead.insertRow()

  const sheetHeaders = sectionName === 'Encaminhamento' ? sheetHeadersEncaminhamento : sheetHeadersMemorando

  sheetHeaders.forEach(text => {
    const th = document.createElement('th')
    th.textContent = text
    headRow.appendChild(th)
  })

  const tbody = table.createTBody()

  items.forEach((item, index) => {
    const row = tbody.insertRow()
    row.className = index % 2 === 0 ? 'row-even' : 'row-odd'

    sheetHeaders.forEach((header) => {
      const cell = row.insertCell()
      
      // Lógica especial para a coluna PDF
      if (header === 'pdf') {
        const btnSinglePdf = document.createElement('button')
        btnSinglePdf.textContent = 'PDF'
        btnSinglePdf.className = 'pdf-table-btn' 
        btnSinglePdf.type = 'button'
        btnSinglePdf.onclick = () => generatePdf(item)
        cell.appendChild(btnSinglePdf)
      } else {
        const key = normalizeKey(item, header)
        let value = key ? item[key] : ''

        if (header === 'Expedição' && (!value || String(value).trim() === '')) {
          value = getTodayDate()
        }
        cell.textContent = value ?? ''
      }
    })
  })


  table.appendChild(tbody)
  wrapper.appendChild(btnCopyAll)
  wrapper.appendChild(btnDownloadAll)
  wrapper.appendChild(table)
  container.appendChild(wrapper)
}

const createCard = (container, title, body) => {
  const card = document.createElement('div')
  card.className = 'card-item'

  const content = document.createElement('div')
  content.className = 'card-content'

  if (typeof body === 'string') {
    const p = document.createElement('p')
    p.textContent = body
    content.appendChild(p)
  } else if (typeof body === 'object' && body !== null) {
    Object.entries(body).forEach(([key, value]) => {
      const p = document.createElement('p')
      p.innerHTML = `<strong>${key}:</strong> ${value ?? ''}`
      content.appendChild(p)
    })
  } else {
    const p = document.createElement('p')
    p.textContent = String(body)
    content.appendChild(p)
  }

  const button = document.createElement('button')
  button.className = 'copy-btn'
  button.type = 'button'
  button.textContent = 'Copiar'

  const textToCopy = title + '\n' + (typeof body === 'string' ? body : formatObjectToText(body))

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(textToCopy)
      button.textContent = 'Copiado!'
      button.classList.add('copied')
      setTimeout(() => {
        button.textContent = 'Copiar'
        button.classList.remove('copied')
      }, 1400)
    } catch (err) {
      console.error('Erro ao copiar:', err)
      button.textContent = 'Erro'
      setTimeout(() => {
        button.textContent = 'Copiar'
      }, 1400)
    }
  })

  card.appendChild(content)
  card.appendChild(button)
  container.appendChild(card)
}

const populateSection = (items, listNode, sectionNode, sectionName) => {
  listNode.innerHTML = ''

  if (!Array.isArray(items) || items.length === 0) {
    sectionNode.classList.add('hidden')
    return
  }

  sectionNode.classList.remove('hidden')

  if (sectionName === 'Memorando' || sectionName === 'Encaminhamento') {
    createSpreadsheet(listNode, items, sectionName)
  } else {
    items.forEach((item, index) => {
      const title = `${sectionName} #${index + 1}`
      createCard(listNode, title, item)
    })
  }
}

export function memorandosResult(data) {
  if (!data || typeof data !== 'object') {
    return
  }

  populateSection(data.memorandos || [], memorandosList, memorandosSection, 'Memorando')
  populateSection(data.encaminhamentos || [], encaminhamentosList, encaminhamentosSection, 'Encaminhamento')
  populateSection(data.emails || [], emailsList, emailsSection, 'E-mail')
}

