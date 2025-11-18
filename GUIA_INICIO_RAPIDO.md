# 🚀 GUÍA RÁPIDA DE INICIO - Sistema de Carpetas

## ⚡ Inicio Rápido

### 1️⃣ Iniciar el Servidor

```powershell
# Asegúrate de estar en la carpeta del backend
cd c:\Users\Jampi\OneDrive\Documentos\Intranet\Intranet-Backend

# Iniciar el servidor
node main.js
```

**Salida esperada:**
```
🚀 === INICIANDO SERVIDOR ===
Puerto: 5000
MongoDB URI: SET
✅ Conectado a MongoDB
📁 Inicializando estructura de carpetas...
✅ Carpeta raíz creada para compras
✅ Carpeta raíz creada para contabilidad
✅ Carpeta raíz creada para credito
✅ Carpeta raíz creada para tesoreria
✅ Carpeta raíz creada para riesgos
✅ Carpeta raíz creada para sistemas
✅ Carpeta raíz creada para talentoHumano
✅ Carpeta raíz creada para controlInterno
✅ Carpeta raíz creada para gerencia
✅ Estructura de carpetas inicializada
✅ Servidor escuchando en el puerto 5000
```

---

### 2️⃣ Abrir Interfaz de Prueba

1. **Abrir archivo HTML en navegador:**
   - Doble click en: `test-carpetas.html`
   - O arrastrarlo al navegador

2. **Verificar conexión:**
   - La página cargará automáticamente la estructura de carpetas
   - Deberías ver la carpeta raíz "Documentos" en el árbol

---

### 3️⃣ Probar Funcionalidades

#### ✅ **Test 1: Crear Carpetas**
1. Click en "Cargar Estructura" (si no cargó automáticamente)
2. En el panel "Crear Carpeta":
   - Nombre: `Contratos`
   - Carpeta Padre: `/`
   - Click en "Crear Carpeta"
3. **Resultado esperado**: Carpeta creada exitosamente, aparece en el árbol

#### ✅ **Test 2: Crear Subcarpetas**
1. Click en la carpeta "Contratos" en el árbol (se seleccionará)
2. En "Crear Carpeta":
   - Nombre: `2024`
   - Carpeta Padre: `/Contratos/` (se autocompletó)
   - Click en "Crear Carpeta"
3. **Resultado esperado**: Subcarpeta creada dentro de Contratos

#### ✅ **Test 3: Subir Documento**
1. Click en la carpeta donde quieres subir
2. En el panel "Subir Documento":
   - Título: `Contrato Proveedor ABC`
   - Descripción: `Contrato anual con proveedor ABC`
   - Carpeta Destino: (ya está seleccionada)
   - Archivos: Seleccionar uno o varios archivos
   - Click en "Subir Documento"
3. **Resultado esperado**: Documento subido, archivos en Firebase Storage

#### ✅ **Test 4: Listar Documentos**
1. En "Listar Documentos":
   - Filtrar por Carpeta: `/Contratos/`
   - Click en "Listar Documentos"
2. **Resultado esperado**: Lista de documentos de esa carpeta

#### ✅ **Test 5: Mover Documento**
1. Copiar el `_id` de un documento de la lista
2. En "Mover Documento":
   - ID del Documento: (pegar el ID)
   - Carpeta Destino: `/` (o cualquier otra)
   - Click en "Mover Documento"
3. **Resultado esperado**: Documento movido a nueva ubicación

#### ✅ **Test 6: Buscar Documentos**
1. En "Listar Documentos":
   - Buscar: `ABC`
   - Click en "Listar Documentos"
2. **Resultado esperado**: Solo documentos que contienen "ABC"

#### ✅ **Test 7: Eliminar Carpeta Vacía**
1. Crear carpeta temporal: `Temp`
2. En "Eliminar Carpeta":
   - Path: `/Temp/`
   - Click en "Eliminar Carpeta"
3. **Resultado esperado**: Carpeta eliminada

#### ❌ **Test 8: Intentar Eliminar Carpeta con Contenido**
1. Intentar eliminar `/Contratos/` (que tiene documentos)
2. **Resultado esperado**: Error - Solo se pueden eliminar carpetas vacías

---

## 🔍 Verificar en MongoDB

### Usando MongoDB Compass o Shell:

```javascript
// Ver todas las carpetas de compras
db.folders.find({ department: 'compras' })

// Ver todos los documentos
db.compras.find()

// Ver documentos de una carpeta específica
db.compras.find({ folderPath: '/Contratos/' })

// Contar carpetas por departamento
db.folders.aggregate([
  { $group: { _id: '$department', count: { $sum: 1 } } }
])
```

---

## 📡 Probar con cURL (PowerShell)

### **Obtener Estructura**
```powershell
curl http://localhost:5000/api/compras/folders
```

### **Crear Carpeta**
```powershell
curl -Method POST `
  -Uri "http://localhost:5000/api/compras/folders" `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"name":"Facturas","parentPath":"/"}'
```

### **Listar Documentos**
```powershell
curl http://localhost:5000/api/compras
```

### **Listar Documentos de Carpeta**
```powershell
curl "http://localhost:5000/api/compras?folderId=/Contratos/"
```

### **Buscar Documentos**
```powershell
curl "http://localhost:5000/api/compras?search=ABC"
```

### **Eliminar Carpeta**
```powershell
curl -Method DELETE `
  -Uri "http://localhost:5000/api/compras/folders/%2FTemp%2F"
```

---

## 🐛 Solución de Problemas

### **Problema: Puerto 5000 ocupado**
```powershell
# Detener proceso que usa el puerto 5000
Get-Process -Name "node" | Stop-Process -Force

# O cambiar puerto en .env
PORT=5001
```

### **Problema: No conecta a MongoDB**
```powershell
# Verificar variable de entorno
echo $env:MONGO_URI

# Verificar que MongoDB esté corriendo
# (MongoDB Atlas o local)
```

### **Problema: CORS Error**
- Asegúrate de que el servidor esté corriendo
- Verifica que la URL en el HTML sea correcta: `http://localhost:5000`

### **Problema: Error al subir archivos**
- Verifica que los archivos sean < 10MB
- Verifica que el tipo de archivo sea permitido
- Verifica que la carpeta destino exista

---

## 📊 Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/compras/folders` | Obtener estructura completa |
| POST | `/api/compras/folders` | Crear carpeta |
| DELETE | `/api/compras/folders/:path` | Eliminar carpeta |
| GET | `/api/compras/folders/:path/items` | Items de carpeta |
| GET | `/api/compras` | Listar documentos |
| POST | `/api/compras` | Subir documento |
| PUT | `/api/compras/:id/move` | Mover documento |
| DELETE | `/api/compras/:id` | Eliminar documento |

---

## ✅ Checklist de Verificación

- [ ] Servidor iniciado correctamente
- [ ] MongoDB conectado
- [ ] Carpetas raíz creadas para todos los departamentos
- [ ] test-carpetas.html abre sin errores
- [ ] Puedo ver la estructura de carpetas
- [ ] Puedo crear carpetas
- [ ] Puedo subir documentos
- [ ] Puedo listar documentos
- [ ] Puedo mover documentos
- [ ] Puedo buscar documentos
- [ ] Puedo eliminar carpetas vacías
- [ ] Las validaciones funcionan correctamente

---

## 📚 Documentación Adicional

- `SISTEMA_CARPETAS_IMPLEMENTADO.md` - Documentación completa de la API
- `RESUMEN_IMPLEMENTACION.md` - Resumen ejecutivo
- `DOCUMENTACION_BACKEND_ADMINISTRADOR_ARCHIVOS.md` - Especificaciones originales

---

## 🎯 Próximos Pasos

1. **Verificar que todo funciona** usando `test-carpetas.html`
2. **Integrar con tu frontend** siguiendo los ejemplos en la documentación
3. **Eliminar uso de localStorage** en el frontend
4. **Implementar las funciones de API** en lugar de las funciones locales

---

## 💡 Tips

- **Usa el árbol de carpetas** en test-carpetas.html para seleccionar carpetas fácilmente
- **Copia los IDs** de los documentos del resultado JSON para moverlos
- **Recarga la estructura** después de cada operación para ver los cambios
- **Lee los mensajes de error** en la sección de resultados

---

## 🎉 ¡Todo Listo!

El sistema está completamente funcional y listo para usar.

**¿Dudas?** Revisa la documentación completa en:
- `SISTEMA_CARPETAS_IMPLEMENTADO.md`

**¿Problemas?** Revisa la sección de troubleshooting arriba.

---

**Última actualización**: 17 de Noviembre de 2025
