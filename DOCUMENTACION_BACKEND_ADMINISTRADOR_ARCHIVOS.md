# 📁 Documentación del Sistema de Administrador de Archivos - Backend

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Estructura de Datos Actual](#estructura-de-datos-actual)
3. [Funcionalidades del Frontend](#funcionalidades-del-frontend)
4. [Especificaciones del Backend Requerido](#especificaciones-del-backend-requerido)
5. [Endpoints de la API](#endpoints-de-la-api)
6. [Modelos de Base de Datos](#modelos-de-base-de-datos)
7. [Lógica de Negocio](#lógica-de-negocio)
8. [Seguridad y Validaciones](#seguridad-y-validaciones)
9. [Ejemplos de Implementación](#ejemplos-de-implementación)

---

## 📌 Descripción General

El sistema de administrador de archivos del módulo de **Compras** (y aplicable a otros módulos departamentales) actualmente utiliza **localStorage** para gestionar una estructura jerárquica de carpetas y documentos. Se requiere migrar toda esta funcionalidad al **backend** para:

- ✅ Persistencia real de datos
- ✅ Sincronización entre usuarios
- ✅ Respaldo y recuperación de información
- ✅ Control de acceso y auditoría
- ✅ Escalabilidad del sistema

### 🎯 Objetivo Principal
Implementar un backend robusto que gestione:
- Estructura de carpetas jerárquica
- Documentos con múltiples archivos adjuntos
- Operaciones de drag & drop (mover documentos entre carpetas)
- Búsqueda y filtrado de documentos
- Descarga de archivos individuales y masivos

---

## 🗂️ Estructura de Datos Actual

### Estado Actual en Frontend (localStorage)

El frontend maneja dos estructuras principales:

#### 1. **Estructura de Carpetas** (`folderStructure`)
```javascript
{
  '/': {
    id: 'root',
    name: 'Documentos',
    type: 'folder',
    path: '/',
    parent: null,
    children: {
      'Contratos': '/Contratos/',
      'Facturas': '/Facturas/'
    },
    documents: ['doc_id_1', 'doc_id_2'],  // IDs de documentos en esta carpeta
    createdAt: '2025-11-17T10:00:00.000Z'
  },
  '/Contratos/': {
    id: 'folder_1234567890',
    name: 'Contratos',
    type: 'folder',
    path: '/Contratos/',
    parent: '/',
    children: {
      '2024': '/Contratos/2024/'
    },
    documents: ['doc_id_3'],
    createdAt: '2025-11-17T10:05:00.000Z'
  },
  '/Contratos/2024/': {
    id: 'folder_1234567891',
    name: '2024',
    type: 'folder',
    path: '/Contratos/2024/',
    parent: '/Contratos/',
    children: {},
    documents: ['doc_id_4', 'doc_id_5'],
    createdAt: '2025-11-17T10:10:00.000Z'
  }
}
```

#### 2. **Documentos** (`rows`)
```javascript
[
  {
    _id: 'doc_id_1',
    documento: 'Contrato Proveedor ABC',
    descripcion: 'Contrato anual con proveedor ABC',
    createdAt: '2025-11-17T10:00:00.000Z',
    tieneArchivos: true,
    cantidadArchivos: 2,
    documentos: [
      {
        _id: 'file_id_1',
        originalName: 'contrato_abc.pdf',
        downloadURL: 'https://firebase-storage.url/contrato_abc.pdf',
        firebaseRef: 'compras/contrato_abc.pdf',
        size: 1024000,
        mimetype: 'application/pdf',
        uploadDate: '2025-11-17T10:00:00.000Z'
      },
      {
        _id: 'file_id_2',
        originalName: 'anexo_contrato.docx',
        downloadURL: 'https://firebase-storage.url/anexo_contrato.docx',
        firebaseRef: 'compras/anexo_contrato.docx',
        size: 512000,
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadDate: '2025-11-17T10:00:00.000Z'
      }
    ],
    // Propiedades calculadas en frontend
    archivos: [
      {
        id: 'file_id_1',
        nombre: 'contrato_abc.pdf',
        url: 'https://firebase-storage.url/contrato_abc.pdf',
        tamaño: '1.00 MB',
        formato: 'pdf',
        fechaSubida: '17/11/2025',
        firebaseRef: 'compras/contrato_abc.pdf',
        mimetype: 'application/pdf'
      }
    ]
  }
]
```

---

## 🎨 Funcionalidades del Frontend

### 1. **Navegación de Carpetas**
- ✅ Vista tipo explorador de archivos
- ✅ Breadcrumb navigation (Documentos > Contratos > 2024)
- ✅ Navegación hacia atrás con botón
- ✅ Click en carpetas para abrirlas
- ✅ Click en documentos para ver detalles

### 2. **Gestión de Carpetas**
```javascript
// Funciones actuales del frontend
createFolder(name, parentPath)       // Crear nueva carpeta
deleteFolder(folderPath)             // Eliminar carpeta vacía
navigateToFolder(folderPath)         // Navegar a carpeta
getAvailableFolders()                // Obtener lista de carpetas
```

### 3. **Gestión de Documentos**
```javascript
// Funciones de documentos
uploadFiles()                         // Subir múltiples archivos (cada uno como documento)
deleteDocument(document)              // Eliminar documento y archivos
viewDocument(document)                // Ver detalles del documento
moveDocumentToFolder(docId, folderPath) // Mover documento a carpeta
```

### 4. **Drag & Drop**
- ✅ Arrastrar documentos sobre carpetas
- ✅ Mover documentos entre carpetas
- ✅ Visual feedback durante drag

### 5. **Búsqueda y Filtrado**
```javascript
searchDocuments()  // Busca en títulos de documentos y nombres de archivos
clearSearch()      // Limpia búsqueda
```

### 6. **Descarga de Archivos**
```javascript
downloadDocumentsSimple(document)     // Descarga todos los archivos de un documento
downloadSingleFileSimple(file)        // Descarga archivo individual
```

---

## 🔧 Especificaciones del Backend Requerido

### Tecnologías Actuales
- **Backend Framework**: Node.js + Express
- **Base de Datos**: MongoDB
- **Almacenamiento**: Firebase Storage
- **Departamento**: `compras` (ruta base: `/api/compras`)

### Requisitos Generales
1. **Persistencia**: Todos los datos deben guardarse en MongoDB
2. **Almacenamiento de Archivos**: Continuar usando Firebase Storage
3. **Estructura Jerárquica**: Soporte completo para carpetas anidadas
4. **Relaciones**: Mantener relaciones entre carpetas y documentos
5. **Validaciones**: Validar datos de entrada y permisos
6. **Performance**: Optimizar consultas para estructuras grandes

---

## 🛣️ Endpoints de la API

### 📁 **Carpetas**

#### 1. **GET /api/compras/folders**
Obtener toda la estructura de carpetas del departamento

**Response:**
```json
{
  "success": true,
  "data": {
    "/": {
      "id": "root",
      "name": "Documentos",
      "type": "folder",
      "path": "/",
      "parent": null,
      "children": {
        "Contratos": "/Contratos/"
      },
      "documents": ["doc_id_1", "doc_id_2"],
      "createdAt": "2025-11-17T10:00:00.000Z"
    },
    "/Contratos/": {
      "id": "folder_12345",
      "name": "Contratos",
      "type": "folder",
      "path": "/Contratos/",
      "parent": "/",
      "children": {},
      "documents": ["doc_id_3"],
      "createdAt": "2025-11-17T10:05:00.000Z"
    }
  }
}
```

#### 2. **POST /api/compras/folders**
Crear una nueva carpeta

**Request Body:**
```json
{
  "name": "Facturas 2024",
  "parentPath": "/Facturas/"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Carpeta creada exitosamente",
  "data": {
    "id": "folder_1731852000000",
    "name": "Facturas 2024",
    "type": "folder",
    "path": "/Facturas/Facturas 2024/",
    "parent": "/Facturas/",
    "children": {},
    "documents": [],
    "createdAt": "2025-11-17T12:00:00.000Z"
  }
}
```

**Validaciones:**
- ✅ Nombre no vacío (trim)
- ✅ Máximo 50 caracteres
- ✅ Sin caracteres especiales: `<>:"/\|?*`
- ✅ No duplicar nombres en la misma carpeta padre
- ✅ Parent path debe existir

#### 3. **DELETE /api/compras/folders/:folderPath**
Eliminar una carpeta (solo si está vacía)

**URL Parameter:** `folderPath` (URL encoded)
Ejemplo: `/api/compras/folders/%2FContratos%2F2024%2F`

**Response:**
```json
{
  "success": true,
  "message": "Carpeta eliminada exitosamente"
}
```

**Validaciones:**
- ✅ No eliminar carpeta raíz `/`
- ✅ Verificar que no tenga subcarpetas (children vacío)
- ✅ Verificar que no tenga documentos (documents vacío)
- ✅ Actualizar referencia en carpeta padre

#### 4. **GET /api/compras/folders/:folderPath/items**
Obtener items (carpetas y documentos) de una carpeta específica

**URL Parameter:** `folderPath` (URL encoded)

**Response:**
```json
{
  "success": true,
  "data": {
    "folders": [
      {
        "id": "folder_123",
        "name": "2024",
        "type": "folder",
        "path": "/Contratos/2024/",
        "createdAt": "2025-11-17T10:00:00.000Z",
        "itemType": "folder",
        "childCount": 2,
        "documentCount": 5
      }
    ],
    "documents": [
      {
        "_id": "doc_id_1",
        "documento": "Contrato ABC",
        "itemType": "document",
        "tieneArchivos": true,
        "cantidadArchivos": 2,
        "createdAt": "2025-11-17T10:00:00.000Z"
      }
    ]
  }
}
```

### 📄 **Documentos**

#### 5. **GET /api/compras**
Obtener todos los documentos (actual, pero mejorado)

**Query Parameters:**
- `folderId` (optional): Filtrar por carpeta específica
- `search` (optional): Término de búsqueda

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "doc_id_1",
      "documento": "Contrato Proveedor ABC",
      "descripcion": "Contrato anual",
      "folderPath": "/Contratos/",
      "createdAt": "2025-11-17T10:00:00.000Z",
      "updatedAt": "2025-11-17T10:00:00.000Z",
      "documentos": [
        {
          "_id": "file_id_1",
          "originalName": "contrato.pdf",
          "downloadURL": "https://firebase.url/file.pdf",
          "firebaseRef": "compras/file.pdf",
          "size": 1024000,
          "mimetype": "application/pdf",
          "uploadDate": "2025-11-17T10:00:00.000Z"
        }
      ],
      "tieneArchivos": true,
      "cantidadArchivos": 1
    }
  ]
}
```

#### 6. **POST /api/compras**
Subir nuevo documento con archivos (modificar existente)

**Content-Type:** `multipart/form-data`

**Form Data:**
```
documento: "Título del documento"
descripcion: "Descripción opcional" (opcional)
folderPath: "/Contratos/" (opcional, default: "/")
documentos: [File, File, File] (múltiples archivos)
```

**Response:**
```json
{
  "success": true,
  "message": "Documento subido exitosamente",
  "data": {
    "_id": "doc_id_new",
    "documento": "Título del documento",
    "descripcion": "Descripción opcional",
    "folderPath": "/Contratos/",
    "createdAt": "2025-11-17T12:00:00.000Z",
    "documentos": [
      {
        "_id": "file_id_new",
        "originalName": "archivo.pdf",
        "downloadURL": "https://firebase.url/archivo.pdf",
        "firebaseRef": "compras/archivo.pdf",
        "size": 2048000,
        "mimetype": "application/pdf",
        "uploadDate": "2025-11-17T12:00:00.000Z"
      }
    ]
  }
}
```

**Validaciones:**
- ✅ Máximo 10 archivos por documento
- ✅ Máximo 10MB por archivo
- ✅ Tipos permitidos: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG, GIF, WEBP, TXT, CSV
- ✅ Título obligatorio
- ✅ Verificar que folderPath exista
- ✅ **IMPORTANTE**: Actualizar array `documents` de la carpeta

#### 7. **PUT /api/compras/:documentId/move**
Mover documento a otra carpeta

**Request Body:**
```json
{
  "targetFolderPath": "/Facturas/2024/"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Documento movido exitosamente",
  "data": {
    "_id": "doc_id_1",
    "documento": "Contrato ABC",
    "folderPath": "/Facturas/2024/",
    "updatedAt": "2025-11-17T12:30:00.000Z"
  }
}
```

**Lógica:**
1. Actualizar `folderPath` del documento
2. **Remover** `documentId` del array `documents` de la carpeta origen
3. **Agregar** `documentId` al array `documents` de la carpeta destino
4. Validar que ambas carpetas existan

#### 8. **DELETE /api/compras/:documentId**
Eliminar documento (ya existe, mantener)

**Response:**
```json
{
  "success": true,
  "message": "Documento y archivos eliminados exitosamente"
}
```

**Lógica adicional:**
- ✅ Eliminar archivos de Firebase Storage
- ✅ **Remover** `documentId` del array `documents` de su carpeta
- ✅ Eliminar documento de MongoDB

#### 9. **GET /api/compras/:documentId/file/:fileIndex/download**
Descargar archivo individual (ya existe, mantener)

**Response:** Redirect a Firebase downloadURL

#### 10. **POST /api/compras/search**
Buscar documentos (opcional, mejorar GET /api/compras)

**Request Body:**
```json
{
  "query": "contrato",
  "folderPath": "/Contratos/",  // opcional
  "fileTypes": ["pdf", "docx"]  // opcional
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "_id": "doc_id_1",
      "documento": "Contrato ABC",
      "folderPath": "/Contratos/",
      "matchedIn": "title",  // 'title' | 'fileName' | 'description'
      "cantidadArchivos": 2
    }
  ],
  "total": 1
}
```

---

## 💾 Modelos de Base de Datos

### 1. **Modelo de Carpeta (Folder)**

```javascript
// models/Folder.js
const mongoose = require('mongoose');

const FolderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
    validate: {
      validator: function(v) {
        return !/[<>:"/\\|?*]/.test(v);
      },
      message: 'Nombre contiene caracteres no permitidos'
    }
  },
  path: {
    type: String,
    required: true,
    unique: true,  // Path debe ser único
    index: true
  },
  type: {
    type: String,
    default: 'folder',
    immutable: true
  },
  parent: {
    type: String,  // Path de la carpeta padre
    default: null,
    index: true
  },
  children: {
    type: Map,
    of: String,  // { "nombre": "/path/" }
    default: {}
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Compra'  // Referencia al modelo de Documento
  }],
  department: {
    type: String,
    required: true,
    enum: ['compras', 'contabilidad', 'credito', 'tesoreria', 'riesgos', 'sistemas', 'talentoHumano', 'controlInterno', 'gerencia'],
    default: 'compras'
  }
}, {
  timestamps: true
});

// Índice compuesto para búsquedas eficientes
FolderSchema.index({ department: 1, path: 1 });
FolderSchema.index({ department: 1, parent: 1 });

module.exports = mongoose.model('Folder', FolderSchema);
```

### 2. **Modelo de Documento (Compra) - Modificado**

```javascript
// models/Compra.js (modelo existente, agregar campos)
const mongoose = require('mongoose');

const CompraSchema = new mongoose.Schema({
  documento: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    default: ''
  },
  // ⭐ NUEVO CAMPO
  folderPath: {
    type: String,
    default: '/',
    index: true
  },
  documentos: [{
    originalName: String,
    downloadURL: String,
    firebaseRef: String,
    size: Number,
    mimetype: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Índices para búsqueda
CompraSchema.index({ documento: 'text', 'documentos.originalName': 'text' });
CompraSchema.index({ folderPath: 1, createdAt: -1 });

module.exports = mongoose.model('Compra', CompraSchema);
```

---

## 🔐 Lógica de Negocio

### Inicialización de Estructura de Carpetas

Cada departamento debe tener una carpeta raíz creada al inicio:

```javascript
// controllers/folderController.js

async function initializeDepartmentFolders(department) {
  const rootExists = await Folder.findOne({ 
    department, 
    path: '/' 
  });
  
  if (!rootExists) {
    await Folder.create({
      name: 'Documentos',
      path: '/',
      type: 'folder',
      parent: null,
      children: {},
      documents: [],
      department
    });
    console.log(`✅ Carpeta raíz creada para ${department}`);
  }
}

// Ejecutar al iniciar el servidor
initializeDepartmentFolders('compras');
```

### Crear Carpeta

```javascript
async function createFolder(req, res) {
  try {
    const { name, parentPath = '/' } = req.body;
    const department = 'compras';  // Obtener del contexto/ruta
    
    // Validaciones
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la carpeta es requerido'
      });
    }
    
    const trimmedName = name.trim();
    
    if (trimmedName.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'El nombre no puede exceder 50 caracteres'
      });
    }
    
    if (/[<>:"/\\|?*]/.test(trimmedName)) {
      return res.status(400).json({
        success: false,
        message: 'Caracteres no permitidos en el nombre'
      });
    }
    
    // Verificar que el padre exista
    const parentFolder = await Folder.findOne({ 
      department, 
      path: parentPath 
    });
    
    if (!parentFolder) {
      return res.status(404).json({
        success: false,
        message: 'Carpeta padre no encontrada'
      });
    }
    
    // Construir nuevo path
    const newPath = parentPath === '/' 
      ? `/${trimmedName}/` 
      : `${parentPath}${trimmedName}/`;
    
    // Verificar que no exista
    const exists = await Folder.findOne({ 
      department, 
      path: newPath 
    });
    
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una carpeta con ese nombre'
      });
    }
    
    // Crear nueva carpeta
    const newFolder = await Folder.create({
      name: trimmedName,
      path: newPath,
      type: 'folder',
      parent: parentPath,
      children: {},
      documents: [],
      department
    });
    
    // Actualizar padre - agregar referencia al hijo
    if (!parentFolder.children) parentFolder.children = new Map();
    parentFolder.children.set(trimmedName, newPath);
    await parentFolder.save();
    
    return res.status(201).json({
      success: true,
      message: 'Carpeta creada exitosamente',
      data: newFolder
    });
    
  } catch (error) {
    console.error('Error al crear carpeta:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear carpeta',
      error: error.message
    });
  }
}
```

### Eliminar Carpeta

```javascript
async function deleteFolder(req, res) {
  try {
    const folderPath = decodeURIComponent(req.params.folderPath);
    const department = 'compras';
    
    // No eliminar raíz
    if (folderPath === '/') {
      return res.status(403).json({
        success: false,
        message: 'No se puede eliminar la carpeta raíz'
      });
    }
    
    // Buscar carpeta
    const folder = await Folder.findOne({ 
      department, 
      path: folderPath 
    });
    
    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Carpeta no encontrada'
      });
    }
    
    // Verificar que esté vacía
    const hasChildren = folder.children && folder.children.size > 0;
    const hasDocuments = folder.documents && folder.documents.length > 0;
    
    if (hasChildren || hasDocuments) {
      return res.status(409).json({
        success: false,
        message: 'Solo se pueden eliminar carpetas vacías'
      });
    }
    
    // Eliminar referencia del padre
    if (folder.parent) {
      const parentFolder = await Folder.findOne({ 
        department, 
        path: folder.parent 
      });
      
      if (parentFolder && parentFolder.children) {
        parentFolder.children.delete(folder.name);
        await parentFolder.save();
      }
    }
    
    // Eliminar carpeta
    await Folder.deleteOne({ _id: folder._id });
    
    return res.status(200).json({
      success: true,
      message: 'Carpeta eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error al eliminar carpeta:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar carpeta',
      error: error.message
    });
  }
}
```

### Subir Documento (Modificar existente)

```javascript
// En el controlador de compras existente, modificar:

async function uploadDocument(req, res) {
  try {
    const { documento, descripcion = '', folderPath = '/' } = req.body;
    const files = req.files;  // Multer
    
    if (!documento || !files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Título y archivos son requeridos'
      });
    }
    
    // Validar cantidad de archivos
    if (files.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Máximo 10 archivos por documento'
      });
    }
    
    // Verificar que la carpeta exista
    const folder = await Folder.findOne({ 
      department: 'compras', 
      path: folderPath 
    });
    
    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Carpeta destino no encontrada'
      });
    }
    
    // Subir archivos a Firebase (lógica existente)
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const firebaseRef = `compras/${Date.now()}_${file.originalname}`;
        const downloadURL = await uploadToFirebase(file, firebaseRef);
        
        return {
          originalName: file.originalname,
          downloadURL,
          firebaseRef,
          size: file.size,
          mimetype: file.mimetype,
          uploadDate: new Date()
        };
      })
    );
    
    // Crear documento
    const newDocument = await Compra.create({
      documento,
      descripcion,
      folderPath,  // ⭐ Nuevo campo
      documentos: uploadedFiles
    });
    
    // ⭐ Actualizar carpeta - agregar documento
    folder.documents.push(newDocument._id);
    await folder.save();
    
    return res.status(201).json({
      success: true,
      message: 'Documento subido exitosamente',
      data: newDocument
    });
    
  } catch (error) {
    console.error('Error al subir documento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al subir documento',
      error: error.message
    });
  }
}
```

### Mover Documento

```javascript
async function moveDocument(req, res) {
  try {
    const { documentId } = req.params;
    const { targetFolderPath } = req.body;
    const department = 'compras';
    
    if (!targetFolderPath) {
      return res.status(400).json({
        success: false,
        message: 'Carpeta destino requerida'
      });
    }
    
    // Buscar documento
    const document = await Compra.findById(documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }
    
    const sourceFolderPath = document.folderPath || '/';
    
    // Si es la misma carpeta, no hacer nada
    if (sourceFolderPath === targetFolderPath) {
      return res.status(200).json({
        success: true,
        message: 'El documento ya está en esa carpeta',
        data: document
      });
    }
    
    // Buscar carpetas
    const [sourceFolder, targetFolder] = await Promise.all([
      Folder.findOne({ department, path: sourceFolderPath }),
      Folder.findOne({ department, path: targetFolderPath })
    ]);
    
    if (!targetFolder) {
      return res.status(404).json({
        success: false,
        message: 'Carpeta destino no encontrada'
      });
    }
    
    // Remover de carpeta origen
    if (sourceFolder) {
      sourceFolder.documents = sourceFolder.documents.filter(
        docId => docId.toString() !== documentId
      );
      await sourceFolder.save();
    }
    
    // Agregar a carpeta destino
    if (!targetFolder.documents.includes(documentId)) {
      targetFolder.documents.push(documentId);
      await targetFolder.save();
    }
    
    // Actualizar documento
    document.folderPath = targetFolderPath;
    await document.save();
    
    return res.status(200).json({
      success: true,
      message: 'Documento movido exitosamente',
      data: document
    });
    
  } catch (error) {
    console.error('Error al mover documento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al mover documento',
      error: error.message
    });
  }
}
```

### Eliminar Documento (Modificar existente)

```javascript
async function deleteDocument(req, res) {
  try {
    const { documentId } = req.params;
    const department = 'compras';
    
    const document = await Compra.findById(documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }
    
    // Eliminar archivos de Firebase
    const deletePromises = document.documentos.map(file => 
      deleteFromFirebase(file.firebaseRef)
    );
    await Promise.all(deletePromises);
    
    // ⭐ Remover documento de su carpeta
    const folder = await Folder.findOne({ 
      department, 
      path: document.folderPath 
    });
    
    if (folder) {
      folder.documents = folder.documents.filter(
        docId => docId.toString() !== documentId
      );
      await folder.save();
    }
    
    // Eliminar documento
    await Compra.deleteOne({ _id: documentId });
    
    return res.status(200).json({
      success: true,
      message: 'Documento y archivos eliminados exitosamente'
    });
    
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar documento',
      error: error.message
    });
  }
}
```

### Obtener Estructura de Carpetas

```javascript
async function getFolderStructure(req, res) {
  try {
    const department = 'compras';
    
    const folders = await Folder.find({ department })
      .sort({ path: 1 })
      .lean();
    
    // Convertir array a objeto con path como key
    const structure = {};
    folders.forEach(folder => {
      // Convertir Map a Object si es necesario
      const childrenObj = {};
      if (folder.children) {
        folder.children.forEach((value, key) => {
          childrenObj[key] = value;
        });
      }
      
      structure[folder.path] = {
        id: folder._id.toString(),
        name: folder.name,
        type: folder.type,
        path: folder.path,
        parent: folder.parent,
        children: childrenObj,
        documents: folder.documents.map(id => id.toString()),
        createdAt: folder.createdAt
      };
    });
    
    return res.status(200).json({
      success: true,
      data: structure
    });
    
  } catch (error) {
    console.error('Error al obtener estructura:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estructura de carpetas',
      error: error.message
    });
  }
}
```

---

## 🔒 Seguridad y Validaciones

### 1. **Validaciones de Entrada**
```javascript
// Middleware de validación
const { body, param } = require('express-validator');

const validateFolderCreation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nombre requerido')
    .isLength({ max: 50 }).withMessage('Máximo 50 caracteres')
    .matches(/^[^<>:"/\\|?*]+$/).withMessage('Caracteres no permitidos'),
  body('parentPath')
    .optional()
    .trim()
    .matches(/^\/.*\/$/).withMessage('Path inválido')
];

const validateDocumentUpload = [
  body('documento')
    .trim()
    .notEmpty().withMessage('Título requerido')
    .isLength({ max: 200 }).withMessage('Título muy largo'),
  body('folderPath')
    .optional()
    .trim()
    .matches(/^\/.*\/$/).withMessage('Path de carpeta inválido')
];

const validateMove = [
  body('targetFolderPath')
    .trim()
    .notEmpty().withMessage('Carpeta destino requerida')
    .matches(/^\/.*\/$/).withMessage('Path inválido')
];
```

### 2. **Sanitización de Paths**
```javascript
function sanitizePath(path) {
  // Prevenir path traversal
  let sanitized = path.replace(/\.\./g, '');
  
  // Asegurar formato correcto
  if (!sanitized.startsWith('/')) {
    sanitized = '/' + sanitized;
  }
  if (!sanitized.endsWith('/')) {
    sanitized = sanitized + '/';
  }
  
  return sanitized;
}
```

### 3. **Control de Acceso**
```javascript
// Middleware de autenticación (usar el existente)
const authMiddleware = require('../middleware/auth');

// Middleware de autorización por departamento
const checkDepartmentAccess = (department) => {
  return (req, res, next) => {
    const userDepartment = req.user.department;  // Del token JWT
    
    if (userDepartment !== department && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este departamento'
      });
    }
    
    next();
  };
};

// Aplicar en rutas
router.get('/folders', 
  authMiddleware, 
  checkDepartmentAccess('compras'), 
  getFolderStructure
);
```

### 4. **Límites de Archivos**
```javascript
const multer = require('multer');

const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024,  // 10MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});
```

---

## 📝 Ejemplos de Rutas (routes/compras.js)

```javascript
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');
const {
  getFolderStructure,
  createFolder,
  deleteFolder,
  getFolderItems
} = require('../controllers/folderController');

const {
  getDocuments,
  uploadDocument,
  deleteDocument,
  moveDocument,
  downloadFile
} = require('../controllers/comprasController');

// ========== RUTAS DE CARPETAS ==========
router.get('/folders', 
  authMiddleware, 
  getFolderStructure
);

router.post('/folders', 
  authMiddleware, 
  createFolder
);

router.delete('/folders/:folderPath', 
  authMiddleware, 
  deleteFolder
);

router.get('/folders/:folderPath/items', 
  authMiddleware, 
  getFolderItems
);

// ========== RUTAS DE DOCUMENTOS ==========
router.get('/', 
  authMiddleware, 
  getDocuments
);

router.post('/', 
  authMiddleware, 
  upload.array('documentos', 10), 
  uploadDocument
);

router.delete('/:documentId', 
  authMiddleware, 
  deleteDocument
);

router.put('/:documentId/move', 
  authMiddleware, 
  moveDocument
);

router.get('/:documentId/file/:fileIndex/download', 
  authMiddleware, 
  downloadFile
);

module.exports = router;
```

---

## 🔄 Migración desde localStorage

### Script de Migración (ejecutar una vez)

```javascript
// scripts/migrateToBackend.js

async function migrateLocalStorageData() {
  try {
    console.log('🚀 Iniciando migración de datos...');
    
    // 1. Crear carpeta raíz si no existe
    await initializeDepartmentFolders('compras');
    
    // 2. Obtener datos del frontend (usuario debe proveerlos)
    const folderStructure = /* datos de localStorage */;
    
    // 3. Crear carpetas en orden (primero raíz, luego profundidad)
    const paths = Object.keys(folderStructure).sort();
    
    for (const path of paths) {
      if (path === '/') continue;  // Ya existe
      
      const folderData = folderStructure[path];
      
      await Folder.create({
        name: folderData.name,
        path: folderData.path,
        type: 'folder',
        parent: folderData.parent,
        children: new Map(Object.entries(folderData.children || {})),
        documents: folderData.documents || [],
        department: 'compras',
        createdAt: folderData.createdAt
      });
      
      console.log(`✅ Carpeta creada: ${path}`);
    }
    
    // 4. Actualizar documentos existentes
    const documents = await Compra.find();
    
    for (const doc of documents) {
      // Buscar en qué carpeta está
      let assignedFolder = '/';
      
      for (const [path, folder] of Object.entries(folderStructure)) {
        if (folder.documents && folder.documents.includes(doc._id.toString())) {
          assignedFolder = path;
          break;
        }
      }
      
      doc.folderPath = assignedFolder;
      await doc.save();
      
      console.log(`✅ Documento actualizado: ${doc.documento} -> ${assignedFolder}`);
    }
    
    console.log('✅ Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
  }
}

// Ejecutar
migrateLocalStorageData();
```

---

## 🧪 Testing

### Tests Unitarios

```javascript
// __tests__/folderController.test.js

const request = require('supertest');
const app = require('../app');
const Folder = require('../models/Folder');

describe('Folder Controller', () => {
  beforeEach(async () => {
    await Folder.deleteMany({});
    await initializeDepartmentFolders('compras');
  });
  
  it('debe crear una carpeta correctamente', async () => {
    const response = await request(app)
      .post('/api/compras/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Contratos',
        parentPath: '/'
      })
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Contratos');
    expect(response.body.data.path).toBe('/Contratos/');
  });
  
  it('debe rechazar nombres duplicados', async () => {
    await Folder.create({
      name: 'Contratos',
      path: '/Contratos/',
      parent: '/',
      department: 'compras'
    });
    
    const response = await request(app)
      .post('/api/compras/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Contratos',
        parentPath: '/'
      })
      .expect(409);
    
    expect(response.body.success).toBe(false);
  });
  
  it('debe eliminar solo carpetas vacías', async () => {
    const folder = await Folder.create({
      name: 'Temporal',
      path: '/Temporal/',
      parent: '/',
      department: 'compras',
      documents: []
    });
    
    const response = await request(app)
      .delete(`/api/compras/folders/${encodeURIComponent(folder.path)}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
  });
});
```

---

## 📚 Recursos Adicionales

### Librerías Recomendadas
- `express-validator`: Validación de datos
- `mongoose`: ODM para MongoDB
- `multer`: Manejo de archivos
- `firebase-admin`: Interacción con Firebase Storage
- `helmet`: Seguridad HTTP
- `express-rate-limit`: Límite de peticiones

### Optimizaciones
1. **Índices MongoDB**: Ya definidos en los esquemas
2. **Caché**: Considerar Redis para estructuras grandes
3. **Paginación**: Implementar en GET /api/compras
4. **Lazy Loading**: Cargar carpetas bajo demanda

### Consideraciones de Escalabilidad
- **Límite de profundidad de carpetas**: Máximo 10 niveles
- **Límite de carpetas por carpeta**: Máximo 100
- **Límite de documentos por carpeta**: Máximo 1000

---

## ✅ Checklist de Implementación

### Backend
- [ ] Crear modelo `Folder`
- [ ] Modificar modelo `Compra` (agregar `folderPath`)
- [ ] Implementar controlador de carpetas
- [ ] Modificar controlador de documentos
- [ ] Crear rutas de carpetas
- [ ] Actualizar rutas de documentos
- [ ] Implementar validaciones
- [ ] Agregar middleware de seguridad
- [ ] Crear script de inicialización
- [ ] Crear script de migración
- [ ] Implementar tests unitarios
- [ ] Documentar API con Swagger

### Frontend (Modificaciones Necesarias)
- [ ] Eliminar uso de localStorage
- [ ] Conectar a endpoints de carpetas
- [ ] Actualizar función `initializeFolderStructure()`
- [ ] Actualizar función `loadDocuments()`
- [ ] Modificar función `uploadFiles()` (enviar folderPath)
- [ ] Actualizar función `createFolder()`
- [ ] Actualizar función `deleteFolder()`
- [ ] Implementar llamadas a API de movimiento
- [ ] Agregar manejo de errores
- [ ] Implementar loading states
- [ ] Agregar sincronización en tiempo real (opcional)

---

## 🎯 Conclusión

Esta documentación proporciona una guía completa para implementar el sistema de administrador de archivos en el backend. La estructura está diseñada para ser:

- ✅ **Escalable**: Soporta múltiples departamentos y estructuras grandes
- ✅ **Segura**: Validaciones y control de acceso implementados
- ✅ **Eficiente**: Índices optimizados y consultas eficientes
- ✅ **Mantenible**: Código modular y bien documentado
- ✅ **Compatible**: Funciona con el frontend existente

El sistema mantiene la misma lógica y estructura que el frontend actual, pero con persistencia real en base de datos.

---

**Fecha de Documentación**: 17 de Noviembre de 2025  
**Versión**: 1.0  
**Autor**: Sistema de Documentación Automática  
**Departamento**: Compras (aplicable a otros departamentos)
