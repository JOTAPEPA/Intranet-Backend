# 🔗 GUÍA DE INTEGRACIÓN FRONTEND - Sistema de Carpetas

## 📋 Objetivo

Este documento contiene toda la información necesaria para integrar el **sistema de administración de archivos con carpetas** en el frontend. El backend ya está **100% implementado y funcional**.

---

## 🎯 Resumen de Cambios en Backend

### ✅ Lo que se implementó:

1. **Sistema de carpetas jerárquicas** - Estructura tipo árbol con profundidad ilimitada
2. **Documentos asociados a carpetas** - Cada documento tiene un `folderPath`
3. **Operaciones de carpetas** - Crear, eliminar, listar
4. **Mover documentos** - Drag & drop entre carpetas
5. **Filtrado y búsqueda** - Por carpeta y texto
6. **Multi-departamento** - 9 departamentos soportados
7. **Inicialización automática** - Carpeta raíz creada al iniciar

---

## 📡 Endpoints de la API (Backend)

### **CARPETAS**

#### 1. Obtener Estructura Completa de Carpetas
```http
GET /api/compras/folders
```

**Response:**
```json
{
  "success": true,
  "data": {
    "/": {
      "id": "673a1b2c3d4e5f6a7b8c9d0e",
      "name": "Documentos",
      "type": "folder",
      "path": "/",
      "parent": null,
      "children": {
        "Contratos": "/Contratos/",
        "Facturas": "/Facturas/"
      },
      "documents": ["673a1b2c...", "673a1b2d..."],
      "createdAt": "2025-11-17T10:00:00.000Z"
    },
    "/Contratos/": {
      "id": "673a1b2c3d4e5f6a7b8c9d0f",
      "name": "Contratos",
      "type": "folder",
      "path": "/Contratos/",
      "parent": "/",
      "children": {
        "2024": "/Contratos/2024/"
      },
      "documents": ["673a1b2e..."],
      "createdAt": "2025-11-17T10:05:00.000Z"
    }
  }
}
```

**Uso en Frontend:**
- Llamar al cargar la página para obtener la estructura completa
- Almacenar en variable global o estado (React/Vue)
- Usar para construir el árbol de navegación

---

#### 2. Crear Nueva Carpeta
```http
POST /api/compras/folders
Content-Type: application/json

{
  "name": "Facturas 2024",
  "parentPath": "/Facturas/"
}
```

**Validaciones:**
- `name`: Requerido, 1-50 caracteres, sin `<>:"/\|?*`
- `parentPath`: Opcional, default `"/"`, debe existir

**Response Success:**
```json
{
  "success": true,
  "message": "Carpeta creada exitosamente",
  "data": {
    "id": "673a1b2c...",
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

**Response Error:**
```json
{
  "success": false,
  "message": "Ya existe una carpeta con ese nombre"
}
```

**Uso en Frontend:**
- Llamar cuando el usuario cree una carpeta
- Validar input antes de enviar
- Recargar estructura después de crear
- Mostrar mensaje de éxito/error

---

#### 3. Eliminar Carpeta
```http
DELETE /api/compras/folders/:folderPath
```

**Ejemplo:**
```http
DELETE /api/compras/folders/%2FFacturas%2F2024%2F
```

⚠️ **IMPORTANTE**: El `folderPath` debe estar **URL encoded**

**Restricciones:**
- ❌ No se puede eliminar la carpeta raíz `"/"`
- ❌ Solo se pueden eliminar carpetas **vacías** (sin subcarpetas ni documentos)

**Response Success:**
```json
{
  "success": true,
  "message": "Carpeta eliminada exitosamente"
}
```

**Response Error:**
```json
{
  "success": false,
  "message": "Solo se pueden eliminar carpetas vacías"
}
```

**Uso en Frontend:**
- Usar `encodeURIComponent(folderPath)` antes de enviar
- Verificar que la carpeta esté vacía antes de intentar eliminar
- Mostrar confirmación antes de eliminar
- Recargar estructura después de eliminar

---

#### 4. Obtener Items de una Carpeta
```http
GET /api/compras/folders/:folderPath/items
```

**Ejemplo:**
```http
GET /api/compras/folders/%2FContratos%2F/items
```

**Response:**
```json
{
  "success": true,
  "data": {
    "folders": [
      {
        "id": "673a1b2c...",
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
        "_id": "673a1b2e...",
        "documento": "Contrato ABC",
        "descripcion": "Contrato anual con proveedor ABC",
        "itemType": "document",
        "tieneArchivos": true,
        "cantidadArchivos": 2,
        "createdAt": "2025-11-17T10:00:00.000Z",
        "documentos": [
          {
            "originalName": "contrato.pdf",
            "downloadURL": "https://firebase...",
            "size": 2048000,
            "mimetype": "application/pdf"
          }
        ]
      }
    ]
  }
}
```

**Uso en Frontend:**
- Llamar al navegar a una carpeta
- Mostrar carpetas y documentos de esa ubicación
- Usar `itemType` para distinguir entre carpeta y documento

---

### **DOCUMENTOS**

#### 5. Listar Documentos (con filtros)
```http
GET /api/compras
GET /api/compras?folderId=/Contratos/
GET /api/compras?search=ABC
GET /api/compras?folderId=/Contratos/&search=ABC
```

**Query Parameters:**
- `folderId` (opcional): Filtrar por carpeta específica
- `search` (opcional): Buscar en título, descripción y nombres de archivo

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "673a1b2e...",
      "documento": "Contrato ABC",
      "descripcion": "Contrato anual",
      "folderPath": "/Contratos/",
      "tieneArchivos": true,
      "cantidadArchivos": 2,
      "documentos": [
        {
          "originalName": "contrato.pdf",
          "downloadURL": "https://firebase...",
          "firebaseRef": "compras/contrato.pdf",
          "size": 2048000,
          "mimetype": "application/pdf",
          "uploadDate": "2025-11-17T10:00:00.000Z"
        }
      ],
      "createdAt": "2025-11-17T10:00:00.000Z"
    }
  ]
}
```

**Uso en Frontend:**
- Llamar para listar documentos con o sin filtros
- Usar `folderId` para mostrar documentos de una carpeta específica
- Usar `search` para búsqueda en tiempo real

---

#### 6. Subir Documento
```http
POST /api/compras
Content-Type: multipart/form-data
```

**Form Data:**
```javascript
const formData = new FormData();
formData.append('documento', 'Título del documento'); // REQUERIDO
formData.append('descripcion', 'Descripción opcional'); // OPCIONAL
formData.append('folderPath', '/Contratos/'); // OPCIONAL (default: "/")
formData.append('documentos', file1); // REQUERIDO (1-10 archivos)
formData.append('documentos', file2);
formData.append('documentos', file3);
```

**⭐ CAMBIO IMPORTANTE**: Ahora se debe enviar el campo `folderPath`

**Validaciones:**
- `documento`: Requerido
- `folderPath`: Debe existir en la base de datos
- `documentos`: 1-10 archivos, máx 10MB cada uno
- Tipos permitidos: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG, GIF, WEBP, TXT, CSV

**Response:**
```json
{
  "success": true,
  "message": "Compra creada exitosamente",
  "data": {
    "_id": "673a1b2f...",
    "documento": "Título del documento",
    "descripcion": "Descripción opcional",
    "folderPath": "/Contratos/",
    "documentos": [
      {
        "originalName": "archivo.pdf",
        "downloadURL": "https://firebase...",
        "size": 2048000
      }
    ],
    "createdAt": "2025-11-17T12:00:00.000Z"
  },
  "filesUploaded": 3
}
```

**Uso en Frontend:**
- Agregar campo `folderPath` al FormData
- Usar la carpeta actual del usuario
- Mostrar mensaje de éxito con cantidad de archivos subidos

---

#### 7. Mover Documento
```http
PUT /api/compras/:documentId/move
Content-Type: application/json

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
    "_id": "673a1b2e...",
    "documento": "Contrato ABC",
    "folderPath": "/Facturas/2024/",
    "updatedAt": "2025-11-17T12:30:00.000Z"
  }
}
```

**Uso en Frontend:**
- Llamar en evento de drag & drop
- Actualizar UI después de mover
- Recargar estructura para actualizar contadores

---

#### 8. Eliminar Documento
```http
DELETE /api/compras/:documentId
```

**Response:**
```json
{
  "success": true,
  "message": "Compra eliminada exitosamente"
}
```

**Acciones del backend:**
- ✅ Elimina archivos de Firebase Storage
- ✅ Remueve documento del array de la carpeta
- ✅ Elimina documento de MongoDB

**Uso en Frontend:**
- Mostrar confirmación antes de eliminar
- Recargar lista después de eliminar

---

#### 9. Descargar Archivo Individual
```http
GET /api/compras/:documentId/file/:fileIndex/download
```

**Ejemplo:**
```http
GET /api/compras/673a1b2e.../file/0/download
```

**Response:**
```json
{
  "downloadURL": "https://firebase...",
  "fileName": "contrato.pdf",
  "size": 2048000,
  "mimetype": "application/pdf"
}
```

**Uso en Frontend:**
- Usar `downloadURL` para descargar o mostrar archivo
- `fileIndex` es el índice en el array `documentos` (0, 1, 2, ...)

---

## 🔧 Implementación en Frontend

### **Cambios Necesarios**

#### ❌ **ELIMINAR** - Ya no se usa localStorage

```javascript
// ❌ ELIMINAR ESTO
function saveFolderStructure(structure) {
  localStorage.setItem('folderStructure', JSON.stringify(structure));
}

function loadFolderStructure() {
  return JSON.parse(localStorage.getItem('folderStructure') || '{}');
}

function saveRows(rows) {
  localStorage.setItem('rows', JSON.stringify(rows));
}

function loadRows() {
  return JSON.parse(localStorage.getItem('rows') || '[]');
}
```

---

#### ✅ **IMPLEMENTAR** - Funciones de API

```javascript
// ========================================
// CONFIGURACIÓN
// ========================================

const API_BASE_URL = 'http://localhost:5000/api/compras';

// ========================================
// FUNCIONES DE CARPETAS
// ========================================

/**
 * Obtener estructura completa de carpetas
 */
async function loadFolderStructure() {
  try {
    const response = await fetch(`${API_BASE_URL}/folders`);
    const result = await response.json();
    
    if (result.success) {
      window.folderStructure = result.data;
      console.log('✅ Estructura cargada:', result.data);
      return result.data;
    } else {
      console.error('❌ Error cargando estructura:', result.message);
      return {};
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
    return {};
  }
}

/**
 * Crear nueva carpeta
 */
async function createFolder(name, parentPath = '/') {
  try {
    const response = await fetch(`${API_BASE_URL}/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name.trim(),
        parentPath: parentPath
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Carpeta creada:', result.data);
      
      // Recargar estructura
      await loadFolderStructure();
      
      // Actualizar UI
      updateFolderTree();
      
      // Mostrar mensaje
      showNotification('Carpeta creada exitosamente', 'success');
      
      return result.data;
    } else {
      console.error('❌ Error creando carpeta:', result.message);
      showNotification(result.message, 'error');
      return null;
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
    showNotification('Error de conexión', 'error');
    return null;
  }
}

/**
 * Eliminar carpeta (solo si está vacía)
 */
async function deleteFolder(folderPath) {
  try {
    // Verificar que la carpeta esté vacía
    const folder = window.folderStructure[folderPath];
    
    if (!folder) {
      showNotification('Carpeta no encontrada', 'error');
      return false;
    }
    
    const hasChildren = Object.keys(folder.children || {}).length > 0;
    const hasDocuments = (folder.documents || []).length > 0;
    
    if (hasChildren || hasDocuments) {
      showNotification('Solo se pueden eliminar carpetas vacías', 'error');
      return false;
    }
    
    // Confirmar eliminación
    if (!confirm(`¿Eliminar la carpeta "${folder.name}"?`)) {
      return false;
    }
    
    // Eliminar en backend
    const encodedPath = encodeURIComponent(folderPath);
    const response = await fetch(`${API_BASE_URL}/folders/${encodedPath}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Carpeta eliminada');
      
      // Recargar estructura
      await loadFolderStructure();
      
      // Actualizar UI
      updateFolderTree();
      
      // Si estábamos en esa carpeta, navegar al padre
      if (currentPath === folderPath) {
        navigateToFolder(folder.parent || '/');
      }
      
      showNotification('Carpeta eliminada exitosamente', 'success');
      return true;
    } else {
      console.error('❌ Error eliminando carpeta:', result.message);
      showNotification(result.message, 'error');
      return false;
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
    showNotification('Error de conexión', 'error');
    return false;
  }
}

/**
 * Obtener items (carpetas + documentos) de una carpeta
 */
async function getFolderItems(folderPath) {
  try {
    const encodedPath = encodeURIComponent(folderPath);
    const response = await fetch(`${API_BASE_URL}/folders/${encodedPath}/items`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      console.error('❌ Error obteniendo items:', result.message);
      return { folders: [], documents: [] };
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
    return { folders: [], documents: [] };
  }
}

// ========================================
// FUNCIONES DE DOCUMENTOS
// ========================================

/**
 * Cargar documentos (con filtros opcionales)
 */
async function loadDocuments(folderPath = null, searchQuery = null) {
  try {
    let url = API_BASE_URL;
    const params = new URLSearchParams();
    
    if (folderPath) {
      params.append('folderId', folderPath);
    }
    
    if (searchQuery) {
      params.append('search', searchQuery);
    }
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ ${result.data.length} documentos cargados`);
      return result.data;
    } else {
      console.error('❌ Error cargando documentos:', result.message);
      return [];
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
    return [];
  }
}

/**
 * Subir documento con archivos
 * ⭐ CAMBIO IMPORTANTE: Ahora incluye folderPath
 */
async function uploadDocument(titulo, descripcion, folderPath, files) {
  try {
    // Validaciones
    if (!titulo || titulo.trim() === '') {
      showNotification('El título es obligatorio', 'error');
      return null;
    }
    
    if (!files || files.length === 0) {
      showNotification('Debe seleccionar al menos un archivo', 'error');
      return null;
    }
    
    if (files.length > 10) {
      showNotification('Máximo 10 archivos por documento', 'error');
      return null;
    }
    
    // Validar tamaño de archivos
    for (let file of files) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        showNotification(`El archivo "${file.name}" excede 10MB`, 'error');
        return null;
      }
    }
    
    // Crear FormData
    const formData = new FormData();
    formData.append('documento', titulo.trim());
    
    if (descripcion && descripcion.trim() !== '') {
      formData.append('descripcion', descripcion.trim());
    }
    
    // ⭐ IMPORTANTE: Agregar folderPath
    formData.append('folderPath', folderPath || '/');
    
    // Agregar archivos
    for (let file of files) {
      formData.append('documentos', file);
    }
    
    // Mostrar loading
    showNotification('Subiendo archivos...', 'info');
    
    // Enviar al backend
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData
      // NO agregar Content-Type, el navegador lo hace automáticamente con boundary
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Documento subido:', result.data);
      showNotification(`Documento subido (${result.filesUploaded} archivos)`, 'success');
      
      // Recargar documentos de la carpeta actual
      await loadAndDisplayDocuments(currentPath);
      
      // Recargar estructura para actualizar contadores
      await loadFolderStructure();
      updateFolderTree();
      
      return result.data;
    } else {
      console.error('❌ Error subiendo documento:', result.message);
      showNotification(result.message, 'error');
      return null;
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
    showNotification('Error de conexión', 'error');
    return null;
  }
}

/**
 * Mover documento a otra carpeta
 */
async function moveDocument(documentId, targetFolderPath) {
  try {
    const response = await fetch(`${API_BASE_URL}/${documentId}/move`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        targetFolderPath: targetFolderPath
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Documento movido:', result.data);
      showNotification('Documento movido exitosamente', 'success');
      
      // Recargar documentos
      await loadAndDisplayDocuments(currentPath);
      
      // Recargar estructura
      await loadFolderStructure();
      updateFolderTree();
      
      return result.data;
    } else {
      console.error('❌ Error moviendo documento:', result.message);
      showNotification(result.message, 'error');
      return null;
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
    showNotification('Error de conexión', 'error');
    return null;
  }
}

/**
 * Eliminar documento
 */
async function deleteDocument(documentId) {
  try {
    if (!confirm('¿Eliminar este documento y todos sus archivos?')) {
      return false;
    }
    
    const response = await fetch(`${API_BASE_URL}/${documentId}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Documento eliminado');
      showNotification('Documento eliminado exitosamente', 'success');
      
      // Recargar documentos
      await loadAndDisplayDocuments(currentPath);
      
      // Recargar estructura
      await loadFolderStructure();
      updateFolderTree();
      
      return true;
    } else {
      console.error('❌ Error eliminando documento:', result.message);
      showNotification(result.message, 'error');
      return false;
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
    showNotification('Error de conexión', 'error');
    return false;
  }
}

/**
 * Buscar documentos
 */
async function searchDocuments(query) {
  if (!query || query.trim() === '') {
    // Si no hay query, cargar todos los documentos de la carpeta actual
    return await loadDocuments(currentPath);
  }
  
  // Buscar en toda la base de datos
  return await loadDocuments(null, query.trim());
}

// ========================================
// FUNCIONES DE UI
// ========================================

/**
 * Inicializar al cargar la página
 */
async function initializeFileManager() {
  console.log('🚀 Inicializando administrador de archivos...');
  
  // Cargar estructura de carpetas
  await loadFolderStructure();
  
  // Construir árbol de carpetas
  updateFolderTree();
  
  // Cargar documentos de la carpeta raíz
  currentPath = '/';
  await loadAndDisplayDocuments(currentPath);
  
  // Configurar event listeners
  setupEventListeners();
  
  console.log('✅ Inicialización completada');
}

/**
 * Actualizar árbol de carpetas en UI
 */
function updateFolderTree() {
  const container = document.getElementById('folder-tree');
  if (!container) return;
  
  container.innerHTML = '';
  
  const structure = window.folderStructure || {};
  const rootFolder = structure['/'];
  
  if (!rootFolder) {
    container.innerHTML = '<p>No hay carpetas</p>';
    return;
  }
  
  const tree = buildFolderTreeHTML(rootFolder, structure);
  container.innerHTML = tree;
}

/**
 * Construir HTML del árbol de carpetas (recursivo)
 */
function buildFolderTreeHTML(folder, structure, level = 0) {
  const indent = level * 20;
  let html = `
    <div class="folder-item" style="padding-left: ${indent}px" data-path="${folder.path}">
      <span class="folder-icon">📁</span>
      <span class="folder-name">${folder.name}</span>
      <span class="folder-count">(${folder.documents.length})</span>
    </div>
  `;
  
  // Agregar subcarpetas
  const children = folder.children || {};
  for (let childName in children) {
    const childPath = children[childName];
    const childFolder = structure[childPath];
    if (childFolder) {
      html += buildFolderTreeHTML(childFolder, structure, level + 1);
    }
  }
  
  return html;
}

/**
 * Cargar y mostrar documentos
 */
async function loadAndDisplayDocuments(folderPath) {
  const documents = await loadDocuments(folderPath);
  displayDocuments(documents);
}

/**
 * Mostrar documentos en la tabla
 */
function displayDocuments(documents) {
  const tbody = document.getElementById('documents-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (documents.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No hay documentos en esta carpeta</td></tr>';
    return;
  }
  
  documents.forEach(doc => {
    const row = document.createElement('tr');
    row.dataset.documentId = doc._id;
    row.draggable = true; // Para drag & drop
    
    row.innerHTML = `
      <td>${doc.documento}</td>
      <td>${doc.descripcion || '-'}</td>
      <td>${doc.cantidadArchivos || 0}</td>
      <td>${new Date(doc.createdAt).toLocaleDateString()}</td>
      <td>
        <button onclick="viewDocument('${doc._id}')">Ver</button>
        <button onclick="deleteDocument('${doc._id}')">Eliminar</button>
      </td>
    `;
    
    // Drag & Drop
    row.addEventListener('dragstart', handleDragStart);
    
    tbody.appendChild(row);
  });
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
  // Click en carpetas del árbol
  document.getElementById('folder-tree')?.addEventListener('click', (e) => {
    const folderItem = e.target.closest('.folder-item');
    if (folderItem) {
      const path = folderItem.dataset.path;
      navigateToFolder(path);
    }
  });
  
  // Botón crear carpeta
  document.getElementById('btn-create-folder')?.addEventListener('click', () => {
    const name = prompt('Nombre de la nueva carpeta:');
    if (name) {
      createFolder(name, currentPath);
    }
  });
  
  // Botón subir archivo
  document.getElementById('btn-upload')?.addEventListener('click', () => {
    const titulo = document.getElementById('input-titulo').value;
    const descripcion = document.getElementById('input-descripcion').value;
    const files = document.getElementById('input-files').files;
    
    if (files.length > 0) {
      uploadDocument(titulo, descripcion, currentPath, Array.from(files));
    }
  });
  
  // Búsqueda
  document.getElementById('input-search')?.addEventListener('input', (e) => {
    const query = e.target.value;
    searchDocuments(query);
  });
  
  // Drop zones para carpetas
  setupDropZones();
}

/**
 * Navegar a una carpeta
 */
function navigateToFolder(folderPath) {
  currentPath = folderPath;
  
  // Actualizar breadcrumb
  updateBreadcrumb(folderPath);
  
  // Cargar documentos
  loadAndDisplayDocuments(folderPath);
  
  // Highlight en el árbol
  document.querySelectorAll('.folder-item').forEach(item => {
    item.classList.remove('selected');
    if (item.dataset.path === folderPath) {
      item.classList.add('selected');
    }
  });
}

/**
 * Actualizar breadcrumb
 */
function updateBreadcrumb(folderPath) {
  const container = document.getElementById('breadcrumb');
  if (!container) return;
  
  const parts = folderPath.split('/').filter(p => p !== '');
  let html = '<a href="#" data-path="/">Documentos</a>';
  
  let currentPath = '/';
  parts.forEach(part => {
    currentPath += part + '/';
    html += ` > <a href="#" data-path="${currentPath}">${part}</a>`;
  });
  
  container.innerHTML = html;
  
  // Event listeners para breadcrumb
  container.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToFolder(link.dataset.path);
    });
  });
}

/**
 * Drag & Drop para mover documentos
 */
function handleDragStart(e) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('documentId', e.target.dataset.documentId);
}

function setupDropZones() {
  document.querySelectorAll('.folder-item').forEach(folder => {
    folder.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      folder.classList.add('drag-over');
    });
    
    folder.addEventListener('dragleave', (e) => {
      folder.classList.remove('drag-over');
    });
    
    folder.addEventListener('drop', async (e) => {
      e.preventDefault();
      folder.classList.remove('drag-over');
      
      const documentId = e.dataTransfer.getData('documentId');
      const targetPath = folder.dataset.path;
      
      if (documentId && targetPath) {
        await moveDocument(documentId, targetPath);
      }
    });
  });
}

/**
 * Mostrar notificación
 */
function showNotification(message, type = 'info') {
  // Implementar según tu sistema de notificaciones
  console.log(`[${type.toUpperCase()}] ${message}`);
  alert(message); // Placeholder, reemplazar con tu sistema
}

// ========================================
// INICIALIZAR AL CARGAR LA PÁGINA
// ========================================

let currentPath = '/';

document.addEventListener('DOMContentLoaded', () => {
  initializeFileManager();
});
```

---

## 📋 Checklist de Implementación

### **1. Preparación**
- [ ] Verificar que el backend está corriendo (`node main.js`)
- [ ] Verificar que MongoDB está conectado
- [ ] Probar endpoints con `test-carpetas.html` o Postman

### **2. Eliminar Código Antiguo**
- [ ] Eliminar funciones de `localStorage`
- [ ] Eliminar lógica de carpetas local
- [ ] Eliminar estructuras de datos locales

### **3. Implementar Funciones de API**
- [ ] Copiar funciones de carpetas (crear, eliminar, listar)
- [ ] Copiar funciones de documentos (subir, mover, eliminar, buscar)
- [ ] Actualizar función de subida para incluir `folderPath`

### **4. Actualizar UI**
- [ ] Conectar árbol de carpetas con API
- [ ] Actualizar navegación entre carpetas
- [ ] Implementar drag & drop con API de mover
- [ ] Actualizar formulario de subida con selector de carpeta

### **5. Testing**
- [ ] Probar crear carpetas
- [ ] Probar subir documentos en diferentes carpetas
- [ ] Probar mover documentos
- [ ] Probar eliminar carpetas y documentos
- [ ] Probar búsqueda
- [ ] Probar filtrado por carpeta

### **6. Pulir**
- [ ] Agregar loading states
- [ ] Mejorar manejo de errores
- [ ] Agregar confirmaciones
- [ ] Mejorar notificaciones
- [ ] Agregar iconos y estilos

---

## ⚠️ Puntos Importantes

### **1. folderPath es Obligatorio**
Al subir documentos, **siempre** enviar el `folderPath`:
```javascript
formData.append('folderPath', currentPath || '/');
```

### **2. URL Encoding para Paths**
Al eliminar carpetas o obtener items, **URL encode** el path:
```javascript
const encodedPath = encodeURIComponent(folderPath);
fetch(`${API_BASE_URL}/folders/${encodedPath}`);
```

### **3. Recargar Después de Cambios**
Después de crear/mover/eliminar, **recargar**:
```javascript
await loadFolderStructure();
updateFolderTree();
await loadAndDisplayDocuments(currentPath);
```

### **4. Validaciones en Frontend**
Validar antes de enviar al backend:
- Nombres de carpetas (caracteres permitidos)
- Tamaño de archivos (< 10MB)
- Cantidad de archivos (< 10)
- Carpetas vacías antes de eliminar

### **5. Manejo de Errores**
Siempre verificar `result.success`:
```javascript
if (result.success) {
  // Operación exitosa
} else {
  // Mostrar error: result.message
}
```

---

## 🧪 Testing

### **Probar con test-carpetas.html**
Antes de integrar en tu frontend, usa `test-carpetas.html` para:
1. Verificar que todos los endpoints funcionan
2. Entender el flujo de datos
3. Ver las respuestas del servidor
4. Probar casos de error

### **Tests Recomendados**
1. ✅ Crear carpeta en raíz
2. ✅ Crear subcarpeta
3. ✅ Subir documento en carpeta
4. ✅ Mover documento entre carpetas
5. ✅ Buscar documentos
6. ✅ Eliminar documento
7. ✅ Intentar eliminar carpeta con contenido (debe fallar)
8. ✅ Eliminar carpeta vacía

---

## 🔍 Debugging

### **Ver Logs del Servidor**
El servidor muestra logs detallados:
```
🔥🔥🔥 === PETICIÓN RECIBIDA ===
⏰ 2025-11-17T12:00:00.000Z
📡 POST /api/compras/folders
✅ Carpeta creada: /Contratos/
```

### **Console.log en Frontend**
Las funciones incluyen logs:
```
✅ Estructura cargada: {...}
✅ Carpeta creada: {...}
✅ 5 documentos cargados
```

### **Errores Comunes**
- **CORS Error**: Verificar que el backend permita el origen del frontend
- **404 Not Found**: Verificar URL y que el servidor esté corriendo
- **Carpeta no existe**: Recargar estructura antes de usar
- **No se puede eliminar**: Verificar que esté vacía

---

## 📚 Recursos Adicionales

- **test-carpetas.html**: Interfaz de prueba completa
- **SISTEMA_CARPETAS_IMPLEMENTADO.md**: Documentación completa de la API
- **GUIA_INICIO_RAPIDO.md**: Instrucciones de inicio

---

## 🎯 Resultado Esperado

Después de implementar estos cambios, el frontend tendrá:

✅ Estructura de carpetas real persistente en base de datos
✅ Navegación tipo explorador de archivos
✅ Subida de documentos en carpetas específicas
✅ Drag & drop funcional para mover documentos
✅ Búsqueda y filtrado por carpeta
✅ Sincronización entre usuarios
✅ Todo persistente (no más localStorage)

---

**Fecha**: 17 de Noviembre de 2025  
**Versión**: 1.0  
**Backend Version**: Completamente implementado  
**Estado**: Listo para integración frontend
