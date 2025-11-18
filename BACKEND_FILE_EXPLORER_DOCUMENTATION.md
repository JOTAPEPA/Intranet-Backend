# 📁 Backend File Explorer System Documentation

## 🎯 **Objetivo**
Implementar un sistema completo de explorador de archivos con carpetas en el backend para sincronizar la estructura de carpetas entre diferentes computadoras y usuarios.

## 📋 **Contexto del Frontend Actual**

### **Módulos con Sistema de Carpetas**
- ✅ `compras.vue` - Sistema completo implementado
- ✅ `contabilidad.vue` - Sistema completo implementado  
- ✅ `controlInterno.vue` - Sistema completo implementado

### **Almacenamiento Actual**
```javascript
// localStorage Keys por módulo
'compras-folder-structure'
'contabilidad-folder-structure'
'control-interno-folder-structure'

// Estructura de datos actual
{
  "carpeta1": {
    "type": "folder",
    "name": "carpeta1", 
    "path": "carpeta1",
    "documents": ["documentId1", "documentId2"]
  },
  "carpeta1/subcarpeta": {
    "type": "folder",
    "name": "subcarpeta",
    "path": "carpeta1/subcarpeta", 
    "documents": ["documentId3"]
  }
}
```

## 🏗️ **Arquitectura Backend Propuesta**

### **1. Modelo de Base de Datos**

#### **Tabla/Colección: `folder_structures`**
```javascript
{
  _id: ObjectId,
  module: String,        // "compras", "contabilidad", "control-interno"
  userId: ObjectId,      // ID del usuario (opcional para compartir)
  departmentId: ObjectId, // ID del departamento (opcional)
  structure: {           // Estructura de carpetas
    "folderPath": {
      type: "folder",
      name: String,
      path: String,
      documents: [ObjectId], // IDs de documentos en esta carpeta
      createdAt: Date,
      createdBy: ObjectId
    }
  },
  createdAt: Date,
  updatedAt: Date,
  version: Number        // Para control de conflictos
}
```

#### **Actualización en Modelos de Documentos**
```javascript
// Agregar a esquemas existentes de documentos
{
  // ... campos existentes
  folderPath: {
    type: String,
    default: null,       // null = documento en raíz
    index: true
  },
  folderHistory: [{     // Historial de movimientos
    fromPath: String,
    toPath: String,
    movedAt: Date,
    movedBy: ObjectId
  }]
}
```

### **2. Endpoints REST API**

#### **📂 Gestión de Estructura de Carpetas**

```http
GET /api/folders/:module
```
**Descripción**: Obtener estructura completa de carpetas para un módulo
**Parámetros**:
- `module`: compras | contabilidad | control-interno
**Respuesta**:
```json
{
  "success": true,
  "data": {
    "structure": { /* estructura de carpetas */ },
    "version": 1,
    "lastUpdated": "2025-11-15T10:30:00Z"
  }
}
```

```http
POST /api/folders/:module
```
**Descripción**: Crear nueva carpeta
**Body**:
```json
{
  "folderPath": "nueva-carpeta",
  "name": "Nueva Carpeta",
  "parentPath": null // null para raíz, "parent" para subcarpeta
}
```

```http
PUT /api/folders/:module
```
**Descripción**: Actualizar estructura completa (sincronización)
**Body**:
```json
{
  "structure": { /* estructura completa */ },
  "version": 1 // Para control de conflictos
}
```

```http
DELETE /api/folders/:module/:folderPath
```
**Descripción**: Eliminar carpeta
**Parámetros**: 
- `folderPath`: Ruta codificada de la carpeta

#### **📄 Gestión de Documentos en Carpetas**

```http
PUT /api/documents/:module/:documentId/move
```
**Descripción**: Mover documento a carpeta
**Body**:
```json
{
  "targetFolderPath": "carpeta-destino", // null para raíz
  "sourceFolderPath": "carpeta-origen"   // null si estaba en raíz
}
```

```http
GET /api/documents/:module/by-folder/:folderPath
```
**Descripción**: Obtener documentos de una carpeta específica

```http
POST /api/folders/:module/:folderPath/documents/bulk-move
```
**Descripción**: Mover múltiples documentos
**Body**:
```json
{
  "documentIds": ["id1", "id2"],
  "targetFolderPath": "destino"
}
```

#### **🔄 Sincronización y Backup**

```http
GET /api/folders/:module/export
```
**Descripción**: Exportar estructura para backup

```http
POST /api/folders/:module/import
```
**Descripción**: Importar estructura desde backup

```http
GET /api/folders/:module/conflicts
```
**Descripción**: Verificar conflictos de versión para sincronización

### **3. Lógica de Negocio Requerida**

#### **Validaciones**
```javascript
// Validar nombre de carpeta
function validateFolderName(name) {
  const invalidChars = /[<>:"/\\|?*]/;
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL'];
  
  return {
    isValid: !invalidChars.test(name) && !reservedNames.includes(name.toUpperCase()),
    maxLength: 255,
    minLength: 1
  };
}

// Validar ruta completa
function validateFolderPath(path) {
  const maxDepth = 10;
  const maxPathLength = 1000;
  
  return {
    depth: path.split('/').length,
    isValid: path.length <= maxPathLength && path.split('/').length <= maxDepth
  };
}
```

#### **Operaciones Atómicas**
```javascript
// Mover documento entre carpetas (transacción)
async function moveDocument(documentId, sourcePath, targetPath, module) {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // 1. Actualizar documento con nueva folderPath
      await Document.updateOne(
        { _id: documentId },
        { 
          folderPath: targetPath,
          $push: {
            folderHistory: {
              fromPath: sourcePath,
              toPath: targetPath,
              movedAt: new Date(),
              movedBy: userId
            }
          }
        }
      );
      
      // 2. Actualizar estructura de carpetas
      await updateFolderStructure(module, sourcePath, targetPath, documentId);
    });
  } finally {
    await session.endSession();
  }
}
```

## 🔧 **Integración con Frontend**

### **Servicios API Frontend**
```javascript
// src/services/folderService.js
export class FolderService {
  static async getFolderStructure(module) {
    return await getData(`/folders/${module}`);
  }
  
  static async createFolder(module, folderData) {
    return await postData(`/folders/${module}`, folderData);
  }
  
  static async updateStructure(module, structure, version) {
    return await putData(`/folders/${module}`, { structure, version });
  }
  
  static async moveDocument(module, documentId, sourcePath, targetPath) {
    return await putData(`/documents/${module}/${documentId}/move`, {
      targetFolderPath: targetPath,
      sourceFolderPath: sourcePath
    });
  }
  
  static async syncWithServer(module, localStructure, localVersion) {
    const serverData = await this.getFolderStructure(module);
    
    if (serverData.version > localVersion) {
      // Server tiene versión más nueva
      return { action: 'pull', data: serverData };
    } else if (localVersion > serverData.version) {
      // Local tiene versión más nueva
      await this.updateStructure(module, localStructure, localVersion + 1);
      return { action: 'push', success: true };
    }
    
    return { action: 'none', message: 'Already synced' };
  }
}
```

### **Migración de localStorage a Backend**
```javascript
// Función de migración para módulos existentes
async function migrateLocalStorageToBackend(module) {
  const localKey = `${module}-folder-structure`;
  const localData = localStorage.getItem(localKey);
  
  if (localData) {
    const structure = JSON.parse(localData);
    
    try {
      await FolderService.updateStructure(module, structure, 1);
      console.log(`✅ ${module} migrado al backend`);
      
      // Opcional: mantener backup local
      localStorage.setItem(`${localKey}-backup`, localData);
    } catch (error) {
      console.error(`❌ Error migrando ${module}:`, error);
    }
  }
}
```

## 🔒 **Consideraciones de Seguridad**

### **Autorización**
```javascript
// Middleware de autorización por módulo
function authorizeModuleAccess(module) {
  return (req, res, next) => {
    const userDepartment = req.user.department;
    const modulePermissions = {
      'compras': ['compras', 'admin'],
      'contabilidad': ['contabilidad', 'admin'],
      'control-interno': ['control-interno', 'admin']
    };
    
    if (modulePermissions[module].includes(userDepartment)) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  };
}
```

### **Validación de Input**
```javascript
// Sanitizar rutas de carpetas
function sanitizeFolderPath(path) {
  return path
    .replace(/[<>:"/\\|?*]/g, '') // Remover caracteres inválidos
    .replace(/\.+/g, '.')         // Normalizar puntos
    .replace(/\s+/g, ' ')         // Normalizar espacios
    .trim();
}
```

## 📊 **Métricas y Monitoreo**

### **Logs Recomendados**
```javascript
// Eventos a registrar
const folderEvents = {
  FOLDER_CREATED: 'folder.created',
  FOLDER_DELETED: 'folder.deleted', 
  DOCUMENT_MOVED: 'document.moved',
  STRUCTURE_SYNCED: 'structure.synced',
  CONFLICT_RESOLVED: 'conflict.resolved'
};

// Ejemplo de log
logger.info('folder.created', {
  module: 'compras',
  folderPath: 'urgente/2024',
  userId: req.user._id,
  timestamp: new Date()
});
```

## 🚀 **Plan de Implementación**

### **Fase 1: Backend Core**
1. Crear modelos de base de datos
2. Implementar endpoints básicos de carpetas
3. Agregar validaciones y middleware de seguridad

### **Fase 2: Operaciones de Documentos**  
1. Implementar movimiento de documentos
2. Agregar endpoints de sincronización
3. Crear sistema de versionado

### **Fase 3: Integración Frontend**
1. Crear servicio de carpetas
2. Implementar sincronización automática
3. Migrar datos de localStorage

### **Fase 4: Características Avanzadas**
1. Resolución de conflictos
2. Historial de movimientos
3. Backup/Restore automático

## 🧪 **Testing**

### **Casos de Prueba Críticos**
```javascript
describe('Folder System', () => {
  test('Create folder with valid name', async () => {
    // Test creación exitosa
  });
  
  test('Reject invalid folder names', async () => {
    // Test validaciones
  });
  
  test('Move document between folders', async () => {
    // Test movimiento atómico
  });
  
  test('Handle concurrent folder operations', async () => {
    // Test condiciones de carrera
  });
  
  test('Sync local and server structures', async () => {
    // Test sincronización
  });
});
```

## 📚 **Recursos Técnicos**

### **Dependencias Backend Sugeridas**
```json
{
  "mongoose": "^7.0.0",      // ODM para MongoDB
  "joi": "^17.0.0",          // Validación de schemas
  "node-cache": "^5.0.0",    // Cache en memoria
  "semver": "^7.0.0"         // Versionado semántico
}
```

### **Configuraciones Recomendadas**
```javascript
// config/folders.js
module.exports = {
  maxFolderDepth: 10,
  maxFolderNameLength: 255,
  maxDocumentsPerFolder: 1000,
  syncInterval: 30000,        // 30 segundos
  cacheTimeout: 300000,       // 5 minutos
  backupRetention: 30         // 30 días
};
```

---

## 🎯 **Resultado Esperado**

Una vez implementado, el sistema permitirá:

- ✅ Sincronización automática entre computadoras
- ✅ Persistencia permanente en base de datos  
- ✅ Control de versiones y resolución de conflictos
- ✅ Backup automático de estructuras
- ✅ Auditoría completa de movimientos
- ✅ Escalabilidad para múltiples usuarios
- ✅ Migración transparente desde localStorage

¡Con esta documentación, Copilot tendrá toda la información necesaria para ayudarte a implementar un sistema robusto y escalable! 🚀