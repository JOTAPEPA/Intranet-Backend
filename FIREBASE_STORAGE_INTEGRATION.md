# Integración de Firebase Storage

## Descripción
Se ha integrado Firebase Storage para el manejo de documentos en la aplicación backend. Esta integración permite subir, almacenar y descargar archivos de forma segura en la nube.

## Archivos modificados/creados

### 1. `/config/firebase.js`
- Configuración centralizada de Firebase
- Inicialización de Firebase Storage
- Exporta la instancia de storage para uso en otros módulos

### 2. `/services/firebaseStorage.js`
- Servicio completo para manejo de Firebase Storage
- Métodos disponibles:
  - `uploadFile(file, folder, customName)` - Subir un archivo
  - `uploadMultipleFiles(files, folder)` - Subir múltiples archivos
  - `getFileDownloadURL(filePath)` - Obtener URL de descarga
  - `deleteFile(filePath)` - Eliminar un archivo
  - `deleteMultipleFiles(filePaths)` - Eliminar múltiples archivos
  - `getFileMetadata(filePath)` - Obtener metadatos de un archivo

### 3. `/models/compras.js` y `/models/contabilidad.js`
- Actualizados para almacenar información de archivos de Firebase Storage
- Campos del documento:
  - `originalName`: Nombre original del archivo
  - `fileName`: Nombre único generado
  - `filePath`: Ruta en Firebase Storage
  - `downloadURL`: URL de descarga directa
  - `mimetype`: Tipo MIME
  - `size`: Tamaño en bytes
  - `uploadDate`: Fecha de subida
  - `firebaseRef`: Referencia de Firebase

### 4. `/controllers/compras.js` y `/controllers/contabilidad.js`
- Actualizados para usar Firebase Storage
- Métodos modificados:
  - `postCompra/postContabilidad`: Ahora sube archivos a Firebase Storage
  - `deleteCompra/deleteContabilidad`: Elimina archivos de Firebase Storage al borrar el registro
- Nuevo método:
  - `getFileDownloadURL`: Obtiene URL de descarga de un archivo específico

### 5. `/routes/compras.js` y `/routes/contabilidad.js`
- Nueva ruta: `GET /:id/file/:fileIndex/download` - Para obtener URL de descarga

### 6. `/Middlewares/uploadMiddleware.js`
- Limpiado y optimizado
- Validación de tipos de archivos
- Límites de tamaño y cantidad de archivos

## API Endpoints

### Subir documentos de compras
```
POST /api/compras
Content-Type: multipart/form-data

Body:
- documento: string (requerido)
- documentos: file[] (archivos a subir)
```

### Subir documentos de contabilidad
```
POST /api/contabilidad
Content-Type: multipart/form-data

Body:
- documento: string (requerido)
- documentos: file[] (archivos a subir)
```

**Respuesta exitosa:**
```json
{
  "message": "Compra creada exitosamente",
  "data": {
    "_id": "...",
    "documento": "...",
    "documentos": [
      {
        "originalName": "archivo.pdf",
        "fileName": "uuid_timestamp.pdf",
        "filePath": "compras/uuid_timestamp.pdf",
        "downloadURL": "https://firebasestorage.googleapis.com/...",
        "mimetype": "application/pdf",
        "size": 1024,
        "uploadDate": "2025-10-21T...",
        "firebaseRef": "compras/uuid_timestamp.pdf"
      }
    ],
    "createdAt": "2025-10-21T...",
    "updatedAt": "2025-10-21T..."
  },
  "filesUploaded": 1,
  "documents": [
    {
      "originalName": "archivo.pdf",
      "downloadURL": "https://firebasestorage.googleapis.com/...",
      "size": 1024
    }
  ]
}
```

### Obtener URL de descarga
```
GET /api/compras/:id/file/:fileIndex/download
GET /api/contabilidad/:id/file/:fileIndex/download
```

**Parámetros:**
- `id`: ID del registro (compra o contabilidad)
- `fileIndex`: Índice del archivo (0, 1, 2, etc.)

**Respuesta exitosa:**
```json
{
  "downloadURL": "https://firebasestorage.googleapis.com/...",
  "fileName": "archivo.pdf",
  "size": 1024,
  "mimetype": "application/pdf"
}
```

### Listar registros
```
GET /api/compras
GET /api/contabilidad
```

### Obtener registro específico
```
GET /api/compras/:id
GET /api/contabilidad/:id
```

### Eliminar registro
```
DELETE /api/compras/:id
DELETE /api/contabilidad/:id
```
*Nota: Al eliminar un registro, también se eliminan todos sus archivos de Firebase Storage*

## Tipos de archivos permitidos

- Imágenes: JPEG, JPG, PNG, GIF, WebP, SVG
- Documentos: PDF, DOC, DOCX, XLS, XLSX
- Texto: TXT, CSV, JSON
- Comprimidos: ZIP

## Límites

- Tamaño máximo por archivo: 10MB
- Máximo de archivos por petición: 10
- Límite total por petición: 100MB

## Estructura de carpetas en Firebase Storage

```
/
├── compras/
│   ├── uuid1_timestamp1.pdf
│   ├── uuid2_timestamp2.jpg
│   └── ...
├── contabilidad/
├── credito/
└── otros-modulos/
```

## Consideraciones de seguridad

1. **Validación de tipos de archivo**: Solo se permiten tipos específicos
2. **Nombres únicos**: Se generan nombres únicos para evitar conflictos
3. **URLs temporales**: Las URLs de descarga pueden tener límites de tiempo
4. **Limpieza automática**: Los archivos se eliminan cuando se borra el documento padre

## Ejemplo de uso en frontend

```javascript
// Subir archivos
const formData = new FormData();
formData.append('documento', 'Factura 001');
formData.append('documentos', file1);
formData.append('documentos', file2);

const response = await fetch('/api/compras', {
  method: 'POST',
  body: formData
});

// Obtener URL de descarga
const downloadResponse = await fetch('/api/compras/compra_id/file/0/download');
const { downloadURL } = await downloadResponse.json();

// Descargar archivo
window.open(downloadURL, '_blank');
```

## Mantenimiento

### Logs
Todos los procesos de subida, descarga y eliminación se registran en los logs del servidor.

### Limpieza
Si es necesario limpiar archivos huérfanos (archivos en Firebase que no tienen referencia en la BD), se puede crear un script de mantenimiento usando el servicio `firebaseStorage.js`.

### Monitoreo
Revisar regularmente:
- Uso de almacenamiento en Firebase Console
- Logs de errores en las operaciones de archivos
- Integridad de referencias entre BD y Firebase Storage