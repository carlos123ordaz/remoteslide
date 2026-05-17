# RemoteSlides — Setup

## 1. Instalar dependencias

```bash
npm install
```

## 2. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear un proyecto
2. Copiar la **URL** y la **anon key** del proyecto

## 3. Variables de entorno

Crear archivo `.env` (copiar de `.env.example`):

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## 4. Base de datos

En el **SQL Editor** de Supabase, ejecutar el contenido de:

```
supabase/migrations/001_schema.sql
```

## 5. Storage

En Supabase → **Storage**, crear un bucket llamado `presentations`:
- Nombre: `presentations`
- ✅ Público: activado (para que los archivos sean accesibles)

O ejecutar en SQL Editor:
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('presentations', 'presentations', true);
```

También agregar estas políticas de storage en SQL Editor:
```sql
CREATE POLICY "storage_select_all" ON storage.objects FOR SELECT USING (bucket_id = 'presentations');
CREATE POLICY "storage_insert_all" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'presentations');
CREATE POLICY "storage_delete_own" ON storage.objects FOR DELETE USING (bucket_id = 'presentations');
```

## 6. Auth con Google

En Supabase → **Authentication** → **Providers** → **Google**:

1. Activar Google provider
2. Crear un proyecto OAuth en [Google Cloud Console](https://console.cloud.google.com/)
3. Crear credenciales OAuth 2.0 con:
   - Orígenes autorizados: `https://tu-proyecto.supabase.co`
   - URIs de redirección: `https://tu-proyecto.supabase.co/auth/v1/callback`
4. Pegar **Client ID** y **Client Secret** en Supabase

Para desarrollo local, también agregar `http://localhost:5173` a los orígenes autorizados en Google.

## 7. Correr en desarrollo

```bash
npm run dev
```

La app estará en `http://localhost:5173`

## Flujo de uso

1. **Landing** (`/`) → "Subir presentación"
2. **Upload** (`/upload`) → arrastrar PDF o PPTX → se sube a Supabase Storage
3. **Session** (`/session/:roomCode`) → ver slides, QR code para el celular
4. **Celular** → escanear QR → abrir `/r/:roomCode` → control remoto en tiempo real
5. **Live** (`/present/:roomCode`) → vista fullscreen en la computadora

## Arquitectura

- **Frontend**: React + Vite
- **Backend**: Supabase (Auth, Database PostgreSQL, Storage, Realtime)
- **PDF rendering**: pdfjs-dist (browser-native)
- **PPTX rendering**: JSZip + XML parsing (extrae texto y estructura)
- **Real-time sync**: Supabase Broadcast channels (< 100ms latencia)
- **Auth**: Google OAuth via Supabase Auth
