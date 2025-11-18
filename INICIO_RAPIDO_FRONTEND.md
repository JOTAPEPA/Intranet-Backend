# 🚀 INICIO RÁPIDO - Sistema de Carpetas (Para IA Frontend)

## 📝 TL;DR (Resumen Ultra Rápido)

**Estado:** ✅ Backend 100% funcional y listo
**Departamentos:** 9 (todos integrados)
**Nuevos endpoints:** 45
**Archivos modificados:** 27

---

## 🎯 Lo Que Necesitas Saber en 60 Segundos

### 1. **¿Qué se hizo?**
Se integró un sistema completo de carpetas jerárquicas en todos los departamentos del backend.

### 2. **¿Qué departamentos?**
TODOS: compras, contabilidad, credito, tesoreria, riesgos, sistemas, talentoHumano, controlInterno, gerencia

### 3. **¿Qué endpoints usar?**
Cada departamento tiene estos 9 endpoints:

```
GET    /api/{dept}/folders                    # Estructura completa
POST   /api/{dept}/folders                    # Crear carpeta
DELETE /api/{dept}/folders/:path              # Eliminar carpeta
GET    /api/{dept}/folders/:path/items        # Ver contenido
POST   /api/{dept}                            # Subir documento
GET    /api/{dept}                            # Listar documentos
DELETE /api/{dept}/:id                        # Eliminar documento
PUT    /api/{dept}/:id/move                   # Mover documento
GET    /api/{dept}/:id/file/:idx/download     # Descargar archivo
```

### 4. **¿Qué campos enviar al subir?**
```javascript
FormData:
  documento: "Título"          // required
  descripcion: "Descripción"   // optional
  folderPath: "/Carpeta/"      // required, default "/"
  documentos: [files]          // multiple files
```

### 5. **¿Qué respuestas esperar?**
```javascript
// Éxito
{ success: true, data: {...} }

// Error
{ success: false, message: "..." }
```

---

## 🏃 IMPLEMENTACIÓN EXPRESS (5 Pasos)

### Paso 1: Crear Servicio de API (5 min)

```typescript
// services/departmentApi.ts
const API_URL = 'http://localhost:5000/api';

export const getfolders = (dept: string) => 
  fetch(`${API_URL}/${dept}/folders`).then(r => r.json());

export const getFolderItems = (dept: string, path: string) => 
  fetch(`${API_URL}/${dept}/folders/${encodeURIComponent(path)}/items`)
    .then(r => r.json());

export const createFolder = (dept: string, name: string, parent: string) =>
  fetch(`${API_URL}/${dept}/folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, parentPath: parent })
  }).then(r => r.json());

export const uploadDocument = (dept: string, formData: FormData) =>
  fetch(`${API_URL}/${dept}`, {
    method: 'POST',
    body: formData
  }).then(r => r.json());
```

### Paso 2: Crear Hook de Estado (10 min)

```typescript
// hooks/useDepartmentFolders.ts
import { useState, useEffect } from 'react';
import * as api from '../services/departmentApi';

export function useDepartmentFolders(department: string) {
  const [folders, setFolders] = useState({});
  const [currentPath, setCurrentPath] = useState('/');
  const [items, setItems] = useState({ folders: [], documents: [] });
  
  const load = async () => {
    const { data } = await api.getFolder(department);
    setFolders(data);
  };
  
  const loadItems = async (path: string) => {
    const { data } = await api.getFolderItems(department, path);
    setItems(data);
    setCurrentPath(path);
  };
  
  useEffect(() => { load(); loadItems('/'); }, [department]);
  
  return { folders, currentPath, items, load, loadItems, setCurrentPath };
}
```

### Paso 3: Componente de Árbol (15 min)

```tsx
// components/FolderTree.tsx
export const FolderTree = ({ folders, selected, onSelect }) => {
  const renderNode = (path: string, depth = 0) => {
    const folder = folders[path];
    if (!folder) return null;
    
    return (
      <div key={path} style={{ marginLeft: depth * 20 }}>
        <div 
          className={selected === path ? 'selected' : ''}
          onClick={() => onSelect(path)}
        >
          📁 {folder.name} 
          <span className="badge">{folder.documents.length}</span>
        </div>
        {Object.values(folder.children).map(child => 
          renderNode(child, depth + 1)
        )}
      </div>
    );
  };
  
  return <div className="tree">{renderNode('/')}</div>;
};
```

### Paso 4: Vista de Contenido (20 min)

```tsx
// components/FolderContent.tsx
export const FolderContent = ({ department, items, onNavigate }) => {
  return (
    <div className="content">
      <div className="grid">
        {items.folders.map(folder => (
          <div key={folder.id} onClick={() => onNavigate(folder.path)}>
            📁 {folder.name}
            <small>{folder.documentCount} docs</small>
          </div>
        ))}
        
        {items.documents.map(doc => (
          <div key={doc._id}>
            📄 {doc.documento}
            <p>{doc.descripcion}</p>
            {doc.documentos.map(file => (
              <a href={file.downloadURL} target="_blank">
                {file.originalName}
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Paso 5: Vista Principal (10 min)

```tsx
// pages/DepartmentPage.tsx
export const DepartmentPage = ({ department }) => {
  const { folders, currentPath, items, loadItems } = useDepartmentFolders(department);
  
  return (
    <div className="layout">
      <aside>
        <FolderTree 
          folders={folders}
          selected={currentPath}
          onSelect={loadItems}
        />
      </aside>
      
      <main>
        <FolderContent 
          department={department}
          items={items}
          onNavigate={loadItems}
        />
      </main>
    </div>
  );
};
```

**¡Listo! Con esto ya tienes un sistema funcional básico.**

---

## 📊 ESTRUCTURA DE DATOS

### Carpeta:
```typescript
{
  id: string;
  name: string;
  path: string;              // "/Facturas/2024/"
  parent: string | null;
  children: { [name]: path };
  documents: string[];       // IDs
  createdAt: string;
}
```

### Documento:
```typescript
{
  _id: string;
  documento: string;         // Título
  descripcion: string;
  folderPath: string;
  documentos: FileInfo[];
  tieneArchivos: boolean;
  cantidadArchivos: number;
  createdAt: string;
}
```

### Archivo:
```typescript
{
  originalName: string;
  downloadURL: string;       // Link directo de Firebase
  size: number;
  mimetype: string;
}
```

---

## 🎨 COMPONENTES MÍNIMOS REQUERIDOS

| Componente | Prioridad | Tiempo Est. |
|-----------|-----------|-------------|
| FolderTree | 🔴 Alta | 15 min |
| FolderContent | 🔴 Alta | 20 min |
| UploadForm | 🟡 Media | 15 min |
| NewFolderModal | 🟡 Media | 10 min |
| DocumentCard | 🟢 Baja | 10 min |
| Breadcrumb | 🟢 Baja | 5 min |

**Total tiempo mínimo:** ~1 hora para MVP funcional

---

## ⚡ FEATURES RÁPIDAS DE IMPLEMENTAR

### 1. **Búsqueda (2 min)**
```typescript
const search = (term: string) => 
  fetch(`${API_URL}/${dept}?search=${term}`).then(r => r.json());
```

### 2. **Filtro por Carpeta (1 min)**
```typescript
const filterByFolder = (path: string) =>
  fetch(`${API_URL}/${dept}?folderId=${path}`).then(r => r.json());
```

### 3. **Subir Documento (5 min)**
```typescript
const upload = (dept: string, title: string, files: File[], path: string) => {
  const formData = new FormData();
  formData.append('documento', title);
  formData.append('folderPath', path);
  files.forEach(f => formData.append('documentos', f));
  return fetch(`${API_URL}/${dept}`, { 
    method: 'POST', 
    body: formData 
  }).then(r => r.json());
};
```

### 4. **Mover Documento (3 min)**
```typescript
const move = (dept: string, docId: string, targetPath: string) =>
  fetch(`${API_URL}/${dept}/${docId}/move`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetFolderPath: targetPath })
  }).then(r => r.json());
```

---

## 🔥 TIPS IMPORTANTES

### ✅ DO:
- Encodear paths en URLs: `encodeURIComponent(path)`
- Recargar items después de crear/mover/eliminar
- Mostrar confirmación antes de eliminar
- Validar nombres de carpetas en frontend
- Usar `downloadURL` directo para archivos

### ❌ DON'T:
- No usar `&&` en paths, siempre terminar en `/`
- No intentar eliminar carpetas con contenido
- No duplicar nombres en mismo nivel
- No exceder 10 archivos por documento
- No olvidar el campo `folderPath` al subir

---

## 🐛 DEBUGGING RÁPIDO

### Error 404:
```
Carpeta no encontrada
→ Verificar que folderPath exista
→ Verificar encoding del path en URL
```

### Error 409:
```
Carpeta ya existe
→ Validar nombre único en nivel actual
```

### Archivos no aparecen:
```
→ Verificar que folderPath esté correcto
→ Recargar items después de subir
→ Verificar respuesta del servidor
```

---

## 📦 LIBRERÍAS RECOMENDADAS

```bash
# File upload con preview
npm install react-dropzone

# Iconos
npm install react-icons

# UI Components
npm install @radix-ui/react-dialog  # Modals
npm install @radix-ui/react-toast   # Notifications

# Gestión de estado (opcional)
npm install zustand
```

---

## 🎯 CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: MVP Básico (1-2 horas)
- [ ] Servicio de API
- [ ] Hook de estado
- [ ] Árbol de carpetas
- [ ] Vista de contenido
- [ ] Formulario de subida
- [ ] Descarga de archivos

### Fase 2: Features Avanzadas (2-3 horas)
- [ ] Modal nueva carpeta
- [ ] Búsqueda en tiempo real
- [ ] Mover documentos
- [ ] Drag & drop
- [ ] Progress bars
- [ ] Confirmaciones

### Fase 3: Polish (1-2 horas)
- [ ] Diseño responsive
- [ ] Animaciones
- [ ] Loading states
- [ ] Error boundaries
- [ ] Iconos por tipo de archivo
- [ ] Breadcrumb navegación

**Total estimado:** 4-7 horas para sistema completo

---

## 📚 DOCUMENTOS DE REFERENCIA

1. **`DOCUMENTACION_FRONTEND_SISTEMA_CARPETAS.md`**
   - 📖 Documentación completa y detallada
   - 🔍 Todos los endpoints explicados
   - 💻 Ejemplos de código completos

2. **`RESUMEN_EJECUTIVO_CARPETAS.md`**
   - 📊 Vista general del proyecto
   - ✅ Checklist de verificación
   - 📈 Métricas del proyecto

3. **Archivos de Prueba:**
   - `test-completo-carpetas.html` (Compras)
   - `test-contabilidad-carpetas.html` (Contabilidad)

---

## 🚀 COMANDO PARA EMPEZAR

```bash
# 1. Asegurar que el backend esté corriendo
cd Back-intranet
node main.js

# 2. En otra terminal, iniciar frontend
cd Front-intranet
npm run dev

# 3. Abrir navegador
http://localhost:5173
```

---

## 💡 ÚLTIMO CONSEJO

**Empieza simple:**
1. Muestra lista de carpetas
2. Click para ver contenido
3. Botón para subir
4. Luego agrega features avanzadas

**El backend ya está listo. Solo necesitas consumir los endpoints.** 🎉

---

## ❓ SI TIENES DUDAS

Revisa los archivos HTML de prueba - tienen **implementaciones completas** que funcionan:
- `test-completo-carpetas.html`
- `test-contabilidad-carpetas.html`

**¡Éxito con la implementación!** 🚀
