# Implementación de Cloudinary para Subida de Archivos

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 2. Obtener Credenciales de Cloudinary

1. Ve a [Cloudinary](https://cloudinary.com/) y crea una cuenta gratuita
2. En el dashboard, encontrarás las credenciales necesarias:
   - Cloud Name
   - API Key
   - API Secret

## Uso de la API

### Crear una Compra con Archivos

**Endpoint:** `POST /api/compras`

**Tipo de Contenido:** `multipart/form-data`

**Campos del formulario:**
- `documento` (string): Texto del documento
- `documentos` (archivos): Múltiples archivos (máximo 10)

**Tipos de archivos permitidos:**
- Imágenes: JPEG, JPG, PNG, GIF
- Documentos: PDF, DOC, DOCX, XLS, XLSX

**Tamaño máximo:** 10MB por archivo

### Ejemplo usando JavaScript (Fetch)

```javascript
const formData = new FormData();
formData.append('documento', 'Descripción del documento');
formData.append('documentos', file1); // File object
formData.append('documentos', file2); // File object

fetch('/api/compras', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => {
    console.log('Compra creada:', data);
});
```

### Ejemplo usando cURL

```bash
curl -X POST \
  http://localhost:3000/api/compras \
  -H 'Content-Type: multipart/form-data' \
  -F 'documento=Mi documento de compra' \
  -F 'documentos=@/path/to/file1.pdf' \
  -F 'documentos=@/path/to/file2.jpg'
```

### Otras Rutas Disponibles

- `GET /api/compras` - Obtener todas las compras
- `GET /api/compras/:id` - Obtener una compra por ID
- `DELETE /api/compras/:id` - Eliminar una compra (también elimina archivos de Cloudinary)

## Estructura de Respuesta

### Respuesta Exitosa (POST)

```json
{
  "message": "Compra created successfully",
  "savedDocument": {
    "_id": "...",
    "documento": "Descripción del documento",
    "documentos": [
      {
        "url": "https://res.cloudinary.com/...",
        "public_id": "compras/...",
        "originalName": "archivo.pdf",
        "format": "pdf",
        "bytes": 123456,
        "uploadDate": "2024-..."
      }
    ],
    "createdAt": "2024-...",
    "updatedAt": "2024-..."
  },
  "filesUploaded": 1
}
```

## Funcionalidades Implementadas

1. **Subida de archivos a Cloudinary**: Los archivos se almacenan en la nube
2. **Validación de tipos de archivo**: Solo se permiten tipos específicos
3. **Límite de tamaño**: Máximo 10MB por archivo
4. **Múltiples archivos**: Hasta 10 archivos por compra
5. **Eliminación automática**: Al eliminar una compra, se eliminan los archivos de Cloudinary
6. **Metadatos**: Se guardan detalles del archivo (nombre original, formato, tamaño, etc.)

## Archivos Creados/Modificados

- `config/cloudinary.js` - Configuración de Cloudinary
- `Middlewares/uploadMiddleware.js` - Middleware para manejo de archivos
- `utils/cloudinaryUtils.js` - Utilidades para subir/eliminar archivos
- `models/compras.js` - Modelo actualizado con campo de documentos
- `controllers/compras.js` - Controlador con funcionalidad de archivos
- `routes/compras.js` - Rutas con middleware de subida

## Consideraciones de Seguridad

1. **Validación de tipos de archivo**: Solo se permiten tipos específicos
2. **Límite de tamaño**: Evita archivos demasiado grandes
3. **Límite de cantidad**: Máximo 10 archivos por solicitud
4. **Variables de entorno**: Las credenciales se almacenan de forma segura
