import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { Wordmark } from '../components/Wordmark'
import { useIsMobile } from '../hooks/useIsMobile'
import { supabase } from '../lib/supabase'
import { generateRoomCode } from '../lib/roomCode'

const PURPLE = 'oklch(0.55 0.21 285)'
const BG = '#FAFAF7'
const FG = '#0A0A0A'
const MUTED = '#6B6B6B'
const BORDER = 'rgba(10,10,10,0.08)'
const BORDER_STRONG = 'rgba(10,10,10,0.14)'

const btnGhost = {
  height: 34, padding: '0 12px', borderRadius: 6,
  background: 'transparent', color: FG, border: '1px solid ' + BORDER_STRONG,
  fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
}

function StepIndicator({ current, isMobile }) {
  const steps = [
    { k: 'upload', l: 'Subir' },
    { k: 'session', l: 'Conectar' },
    { k: 'live', l: 'Presentar' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14, fontFamily: "'Geist Mono', monospace", fontSize: isMobile ? 10 : 11, letterSpacing: 1, textTransform: 'uppercase' }}>
      {steps.map((s, i) => {
        const active = s.k === current
        const done = steps.findIndex((x) => x.k === current) > i
        return (
          <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 8 }}>
            {i > 0 && <div style={{ width: isMobile ? 12 : 24, height: 1, background: BORDER_STRONG }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 8, color: active ? FG : done ? MUTED : '#BABAB4' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: active ? FG : done ? FG : 'transparent', border: '1px solid ' + (active || done ? FG : BORDER_STRONG), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>
                {done ? '✓' : String(i + 1)}
              </span>
              {!isMobile && <span>{s.l}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Upload({ user }) {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) {
      setFile(accepted[0])
      setStatus('idle')
      setError(null)
      setProgress(0)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 200 * 1024 * 1024,
    multiple: false,
  })

  async function handleUpload() {
    if (!file) return
    setStatus('uploading')
    setError(null)

    try {
      const fileType = 'pdf'
      const roomCode = generateRoomCode()
      const filePath = `${roomCode}/${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('presentations')
        .upload(filePath, file, {
          onUploadProgress: ({ loaded, total }) => {
            setProgress(Math.round((loaded / total) * 80))
          },
        })

      if (uploadError) throw uploadError

      setProgress(85)
      setStatus('processing')

      const { data: urlData } = supabase.storage.from('presentations').getPublicUrl(filePath)
      const lib = await import('pdfjs-dist')
      lib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl
      const pdf = await lib.getDocument(urlData.publicUrl).promise
      const slideCount = pdf.numPages

      setProgress(95)

      const sessionData = {
        room_code: roomCode,
        file_name: file.name,
        file_path: filePath,
        file_type: fileType,
        slide_count: slideCount,
        current_slide: 0,
        user_id: user?.id || null,
      }

      const { error: dbError } = await supabase.from('sessions').insert(sessionData)
      if (dbError) throw dbError

      if (user) {
        await supabase.from('presentations').insert({
          user_id: user.id,
          title: file.name.replace(/\.[^.]+$/, ''),
          file_name: file.name,
          file_path: filePath,
          file_type: fileType,
          slide_count: slideCount,
        })
      }

      setProgress(100)
      setStatus('done')

      setTimeout(() => {
        navigate(`/session/${roomCode}`, {
          state: { fileUrl: urlData.publicUrl, fileType, slideCount, fileName: file.name },
        })
      }, 400)
    } catch (e) {
      console.error(e)
      setError(e.message || 'Error al subir el archivo')
      setStatus('error')
      setProgress(0)
    }
  }

  const fileExt = file?.name?.split('.').pop()?.toUpperCase() || 'PDF'
  const fileSizeMB = file ? (file.size / 1024 / 1024).toFixed(1) : ''
  const busy = status === 'uploading' || status === 'processing'
  const done = status === 'done'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: BG, color: FG }}>
      <header style={{ height: 56, display: 'flex', alignItems: 'center', padding: isMobile ? '0 20px' : '0 32px', borderBottom: '1px solid ' + BORDER, flexShrink: 0 }}>
        <Wordmark size={16} />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <StepIndicator current="upload" isMobile={isMobile} />
        </div>
        <button style={btnGhost} onClick={() => navigate('/')}>Cancelar</button>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', padding: isMobile ? '32px 20px' : 48 }}>
        <div style={{ width: '100%', maxWidth: 640 }}>
          <h1 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 600, letterSpacing: '-0.025em', margin: '0 0 8px' }}>
            Subí tu presentación.
          </h1>
          <p style={{ fontSize: 14, color: MUTED, margin: '0 0 24px' }}>
            Arrastrá tu PDF o hacé clic para seleccionarlo. Máx 200 MB.
          </p>

          {/* Dropzone */}
          {!file ? (
            <div
              {...getRootProps()}
              style={{
                background: '#fff',
                border: '2px dashed ' + (isDragActive ? PURPLE : BORDER_STRONG),
                borderRadius: 8,
                padding: isMobile ? '36px 24px' : '48px 36px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              <input {...getInputProps()} />
              <div style={{ width: 44, height: 56, background: BG, border: '1px solid ' + BORDER_STRONG, borderRadius: 4, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 600, color: MUTED }}>
                PDF
              </div>
              {isDragActive ? (
                <p style={{ fontSize: 15, fontWeight: 500, color: FG, margin: 0 }}>Soltá el archivo acá</p>
              ) : (
                <>
                  <p style={{ fontSize: 15, fontWeight: 500, color: FG, margin: '0 0 4px' }}>
                    {isMobile ? 'Tocá para seleccionar' : 'Arrastrá tu PDF acá'}
                  </p>
                  <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>
                    {isMobile ? 'Solo archivos PDF' : 'o hacé clic para explorar'}
                  </p>
                </>
              )}
            </div>
          ) : (
            <div style={{ background: '#fff', border: '2px dashed ' + PURPLE, borderRadius: 8, padding: isMobile ? 20 : 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <FileIcon ext={fileExt} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                  <div style={{ fontSize: 12, color: MUTED, fontFamily: "'Geist Mono', monospace", marginTop: 2 }}>
                    {fileSizeMB} MB ·{' '}
                    {status === 'idle' && 'Listo para subir'}
                    {status === 'uploading' && 'Subiendo…'}
                    {status === 'processing' && 'Procesando…'}
                    {status === 'done' && '✓ Completado'}
                    {status === 'error' && '✕ Error'}
                  </div>
                  {busy || done ? (
                    <div style={{ marginTop: 12, height: 4, background: BORDER, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: progress + '%', height: '100%', background: PURPLE, transition: 'width 0.12s linear' }} />
                    </div>
                  ) : null}
                  {error && <div style={{ marginTop: 6, fontSize: 12, color: '#EF4444', fontFamily: "'Geist Mono', monospace" }}>{error}</div>}
                </div>
                {!busy && !done && (
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, color: FG, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                    {fileSizeMB} MB
                  </div>
                )}
                {(busy) && (
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, color: FG, fontVariantNumeric: 'tabular-nums', fontWeight: 500, flexShrink: 0 }}>{progress}%</div>
                )}
              </div>
            </div>
          )}

          {/* Cambiar archivo */}
          {file && (status === 'idle' || status === 'error') && (
            <button
              onClick={() => { setFile(null); setStatus('idle') }}
              style={{ marginTop: 12, background: 'none', border: 'none', color: MUTED, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
            >
              Elegir otro archivo
            </button>
          )}

          {/* Import alternatives */}
          {!file && (
            <>
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: BORDER }} />
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#9A9A9A', letterSpacing: 1 }}>O</span>
                <div style={{ flex: 1, height: 1, background: BORDER }} />
              </div>
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { l: 'Google Drive', icon: 'GD' },
                  { l: 'Pegar enlace', icon: '→' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#fff', border: '1px solid ' + BORDER, borderRadius: 6, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, opacity: 0.45 }}>
                    <div style={{ width: 26, height: 26, background: BG, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 600, color: MUTED, flexShrink: 0 }}>{s.icon}</div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{s.l}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Action buttons */}
          <div style={{ marginTop: 28, display: 'flex', gap: 10, justifyContent: 'flex-end', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
            {!isMobile && <button style={btnGhost} onClick={() => navigate('/')}>Cancelar</button>}
            <button
              onClick={status === 'error' ? handleUpload : handleUpload}
              disabled={!file || busy || done}
              style={{
                height: isMobile ? 50 : 42,
                padding: '0 22px', borderRadius: 6,
                background: (!file || busy || done) ? BORDER_STRONG : FG,
                color: '#fff', border: 'none', fontFamily: 'inherit',
                fontSize: 14, fontWeight: 500,
                cursor: (!file || busy || done) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: isMobile ? '100%' : 'auto',
              }}
            >
              {busy && <Spinner />}
              {status === 'idle' && 'Subir y continuar →'}
              {status === 'uploading' && 'Subiendo…'}
              {status === 'processing' && 'Procesando…'}
              {status === 'done' && '✓ Completado'}
              {status === 'error' && 'Reintentar →'}
            </button>
          </div>

          <div style={{ marginTop: 16, fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#9A9A9A', letterSpacing: '0.4px' }}>
            {user
              ? `Sesión guardada en tu cuenta · ${user.email}`
              : <>
                  Sin cuenta · la sesión expira en 24 hs ·{' '}
                  <span
                    style={{ color: PURPLE, cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={async () => {
                      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/upload' } })
                    }}
                  >
                    entrar con Google para guardar
                  </span>
                </>
            }
          </div>
        </div>
      </main>
    </div>
  )
}

function FileIcon({ ext }) {
  return (
    <div style={{ width: 48, height: 60, background: BG, border: '1px solid ' + BORDER_STRONG, borderRadius: 4, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6, fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 600, color: PURPLE, position: 'relative', flexShrink: 0 }}>
      {ext}
      <div style={{ position: 'absolute', top: 8, left: 7, right: 7, height: 2, background: BORDER_STRONG }} />
      <div style={{ position: 'absolute', top: 14, left: 7, right: 16, height: 2, background: BORDER_STRONG }} />
      <div style={{ position: 'absolute', top: 20, left: 7, right: 12, height: 2, background: BORDER_STRONG }} />
    </div>
  )
}

function Spinner() {
  return <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
}
