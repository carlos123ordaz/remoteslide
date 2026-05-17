// Basic PPTX parser using JSZip + DOMParser
// Extracts text content and slide count from PPTX files

export async function parsePPTX(file) {
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(file)

  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)/)[1])
      const nb = parseInt(b.match(/slide(\d+)/)[1])
      return na - nb
    })

  if (slideFiles.length === 0) throw new Error('No se encontraron diapositivas en el archivo PPTX')

  const slides = await Promise.all(
    slideFiles.map(async (name, i) => {
      const xml = await zip.files[name].async('string')
      return parseSlideXML(xml, i + 1)
    })
  )

  return slides
}

function parseSlideXML(xml, num) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'application/xml')

  const paragraphs = []

  const txBodies = doc.querySelectorAll('txBody')
  txBodies.forEach((txBody) => {
    const sp = txBody.parentElement
    const ph = sp?.querySelector('ph')
    const isTitle = ph && (ph.getAttribute('type') === 'title' || ph.getAttribute('type') === 'ctrTitle')

    const paras = txBody.querySelectorAll('p')
    paras.forEach((p) => {
      const runs = p.querySelectorAll('t')
      const text = Array.from(runs)
        .map((t) => t.textContent)
        .join('')
        .trim()
      if (text) {
        paragraphs.push({ text, isTitle })
      }
    })
  })

  const titleParagraph = paragraphs.find((p) => p.isTitle)
  const title = titleParagraph?.text || paragraphs[0]?.text || `Diapositiva ${num}`
  const bodyTexts = paragraphs
    .filter((p) => p !== titleParagraph)
    .map((p) => p.text)

  return { num, title, bodyTexts, allTexts: paragraphs.map((p) => p.text) }
}
