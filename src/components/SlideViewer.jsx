import { useEffect, useRef, useState, useCallback } from 'react'
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// Initialize pdf.js once globally
let pdfjsLib = null
let pdfLibLoading = null

async function getPDFLib() {
  if (pdfjsLib) return pdfjsLib
  if (pdfLibLoading) return pdfLibLoading

  pdfLibLoading = import('pdfjs-dist').then((lib) => {
    lib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl
    pdfjsLib = lib
    return lib
  })
  return pdfLibLoading
}

// Cache of loaded PDF documents by URL
const pdfCache = new Map()

async function loadPDF(url) {
  if (pdfCache.has(url)) return pdfCache.get(url)
  const lib = await getPDFLib()
  const loadingTask = lib.getDocument(url)
  const pdf = await loadingTask.promise
  pdfCache.set(url, pdf)
  return pdf
}

// Single PDF page rendered to canvas
function PDFPage({ url, pageNum, width, height, style }) {
  const canvasRef = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!url || !pageNum) return
    let cancelled = false

    async function render() {
      try {
        const pdf = await loadPDF(url)
        if (cancelled) return
        const page = await pdf.getPage(pageNum)
        if (cancelled) return

        const canvas = canvasRef.current
        if (!canvas) return

        const viewport = page.getViewport({ scale: 1 })
        const scale = Math.max(
          (width || canvas.parentElement?.clientWidth || 800) / viewport.width,
          (height || canvas.parentElement?.clientHeight || 600) / viewport.height
        )
        const scaledVp = page.getViewport({ scale })

        canvas.width = scaledVp.width
        canvas.height = scaledVp.height

        await page.render({
          canvasContext: canvas.getContext('2d'),
          viewport: scaledVp,
        }).promise
      } catch (e) {
        if (!cancelled) setError(e.message)
      }
    }

    render()
    return () => { cancelled = true }
  }, [url, pageNum, width, height])

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          color: '#9A9A9A',
          fontFamily: "'Geist Mono', monospace",
          fontSize: 12,
          padding: 16,
          textAlign: 'center',
        }}
      >
        Error al renderizar slide
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', ...style }}
    />
  )
}

// PPTX slide rendered from parsed data
function PPTXPage({ slide }) {
  if (!slide) return <PlaceholderSlide />

  const { title, bodyTexts, num } = slide

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '7% 7.5%',
        boxSizing: 'border-box',
        fontFamily: "'Geist', system-ui, sans-serif",
        overflow: 'hidden',
        position: 'relative',
        containerType: 'inline-size',
      }}
    >
      {title && (
        <div
          style={{
            fontSize: '3.8cqw',
            fontWeight: 600,
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            marginBottom: '3cqw',
            color: '#0A0A0A',
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.4cqw',
          overflow: 'hidden',
        }}
      >
        {(bodyTexts || []).slice(0, 8).map((text, i) => (
          <div
            key={i}
            style={{
              fontSize: '1.6cqw',
              color: '#3A3A3A',
              lineHeight: 1.5,
            }}
          >
            {text}
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          right: '7.5%',
          fontFamily: "'Geist Mono', monospace",
          fontSize: '1cqw',
          color: '#9A9A9A',
          letterSpacing: '1.4px',
        }}
      >
        {String(num).padStart(2, '0')}
      </div>
    </div>
  )
}

function PlaceholderSlide({ num }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#F4F4F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Geist Mono', monospace",
        fontSize: 12,
        color: '#9A9A9A',
        letterSpacing: 1.2,
      }}
    >
      {num ? `SLIDE ${String(num).padStart(2, '0')}` : '—'}
    </div>
  )
}

// Main SlideViewer: renders the correct component based on file type
// fileType: 'pdf' | 'pptx'
// fileUrl: public URL to the file in Supabase Storage
// pptxSlides: parsed PPTX slides array (for pptx type)
// slideIndex: 0-based index
export function SlideViewer({ fileType, fileUrl, pptxSlides, slideIndex, width, height, style }) {
  const pageNum = slideIndex + 1

  if (fileType === 'pdf' && fileUrl) {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', ...style }}>
        <PDFPage url={fileUrl} pageNum={pageNum} width={width} height={height} />
      </div>
    )
  }

  if (fileType === 'pptx' && pptxSlides) {
    const slide = pptxSlides[slideIndex]
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', containerType: 'inline-size', ...style }}>
        <PPTXPage slide={slide} />
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', ...style }}>
      <PlaceholderSlide num={pageNum} />
    </div>
  )
}

// Hook to get the total page count for a PDF
export function usePDFPageCount(url) {
  const [count, setCount] = useState(null)

  useEffect(() => {
    if (!url) return
    let cancelled = false
    loadPDF(url)
      .then((pdf) => { if (!cancelled) setCount(pdf.numPages) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [url])

  return count
}
