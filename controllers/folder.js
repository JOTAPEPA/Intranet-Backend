import Folder from '../models/folder.js';
import Compra from '../models/compras.js';
import mongoose from 'mongoose';

const httpFolder = {

    // Inicializar carpeta raíz de un departamento
    initializeDepartmentFolders: async (department) => {
        try {
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
            } else {
                console.log(`ℹ️ Carpeta raíz ya existe para ${department}`);
            }
        } catch (error) {
            // Si es error de duplicado, ignorar (carpeta ya existe)
            if (error.code === 11000) {
                console.log(`ℹ️ Carpeta raíz ya existe para ${department}`);
            } else {
                console.error(`❌ Error inicializando carpetas para ${department}:`, error);
                throw error;
            }
        }
    },

    // Obtener toda la estructura de carpetas
    getFolderStructure: async (req, res, department = 'compras') => {
        try {
            const folders = await Folder.find({ department })
                .sort({ path: 1 })
                .lean();
            
            // Convertir array a objeto con path como key
            const structure = {};
            folders.forEach(folder => {
                // Convertir Map a Object para JSON
                const childrenObj = {};
                if (folder.children && folder.children instanceof Map) {
                    folder.children.forEach((value, key) => {
                        childrenObj[key] = value;
                    });
                } else if (folder.children && typeof folder.children === 'object') {
                    Object.assign(childrenObj, folder.children);
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
            
            res.status(200).json({
                success: true,
                data: structure
            });
            
        } catch (error) {
            console.error('❌ Error obteniendo estructura:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estructura de carpetas',
                error: error.message
            });
        }
    },

    // Crear nueva carpeta
    createFolder: async (req, res, department = 'compras') => {
        try {
            const { name, parentPath = '/' } = req.body;
            
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
            if (!parentFolder.children) {
                parentFolder.children = new Map();
            }
            parentFolder.children.set(trimmedName, newPath);
            await parentFolder.save();
            
            console.log(`✅ Carpeta creada: ${newPath}`);
            
            return res.status(201).json({
                success: true,
                message: 'Carpeta creada exitosamente',
                data: {
                    id: newFolder._id.toString(),
                    name: newFolder.name,
                    type: newFolder.type,
                    path: newFolder.path,
                    parent: newFolder.parent,
                    children: {},
                    documents: [],
                    createdAt: newFolder.createdAt
                }
            });
            
        } catch (error) {
            console.error('❌ Error al crear carpeta:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al crear carpeta',
                error: error.message
            });
        }
    },

    // Eliminar carpeta (solo si está vacía o recursivamente con force)
    deleteFolder: async (req, res, department = 'compras') => {
        try {
            const folderPath = decodeURIComponent(req.params.folderPath);
            const force = req.query.force === 'true'; // Parámetro para eliminación recursiva
            
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
            
            // Log detallado para debug
            console.log('📂 Intentando eliminar carpeta:', folderPath);
            console.log('   - Tipo de children:', typeof folder.children);
            console.log('   - Children:', folder.children);
            console.log('   - Documentos:', folder.documents);
            
            // Verificar que esté vacía - CORREGIDO: verificar correctamente si tiene elementos
            let hasChildren = false;
            if (folder.children) {
                if (folder.children instanceof Map) {
                    hasChildren = folder.children.size > 0;
                } else if (typeof folder.children === 'object' && folder.children !== null) {
                    hasChildren = Object.keys(folder.children).length > 0;
                }
            }
            const hasDocuments = folder.documents && folder.documents.length > 0;
            
            console.log('   - Tiene hijos:', hasChildren);
            console.log('   - Tiene documentos:', hasDocuments);
            
            // Si tiene contenido y no es force, rechazar
            if ((hasChildren || hasDocuments) && !force) {
                // Contar subcarpetas reales
                let realSubfolders = 0;
                if (hasChildren) {
                    const childPaths = [];
                    if (folder.children instanceof Map) {
                        folder.children.forEach(value => childPaths.push(value));
                    } else if (typeof folder.children === 'object') {
                        Object.values(folder.children).forEach(value => childPaths.push(value));
                    }
                    realSubfolders = await Folder.countDocuments({
                        department,
                        path: { $in: childPaths }
                    });
                }
                
                console.log('   - Subcarpetas reales:', realSubfolders);
                console.log('   - Documentos reales:', hasDocuments ? folder.documents.length : 0);
                
                return res.status(409).json({
                    success: false,
                    message: 'Solo se pueden eliminar carpetas vacías',
                    details: {
                        subcarpetas: realSubfolders,
                        documentos: hasDocuments ? folder.documents.length : 0,
                        tip: 'Use ?force=true para eliminar recursivamente (eliminará todo el contenido)'
                    }
                });
            }
            
            // Si es force, eliminar recursivamente
            if (force) {
                await httpFolder.deleteFolderRecursive(folder, department);
            } else {
                // Eliminación simple
                await Folder.deleteOne({ _id: folder._id });
            }
            
            // Eliminar referencia del padre
            if (folder.parent) {
                const parentFolder = await Folder.findOne({ 
                    department, 
                    path: folder.parent 
                });
                
                if (parentFolder && parentFolder.children) {
                    if (parentFolder.children instanceof Map) {
                        parentFolder.children.delete(folder.name);
                    } else if (typeof parentFolder.children === 'object') {
                        delete parentFolder.children[folder.name];
                    }
                    await parentFolder.save();
                }
            }
            
            console.log(`🗑️ Carpeta eliminada: ${folderPath}`);
            
            return res.status(200).json({
                success: true,
                message: force ? 'Carpeta y todo su contenido eliminados exitosamente' : 'Carpeta eliminada exitosamente'
            });
            
        } catch (error) {
            console.error('❌ Error al eliminar carpeta:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar carpeta',
                error: error.message
            });
        }
    },

    // Función auxiliar para eliminar carpeta recursivamente
    deleteFolderRecursive: async (folder, department) => {
        try {
            // Obtener todas las subcarpetas
            const childPaths = [];
            if (folder.children) {
                if (folder.children instanceof Map) {
                    folder.children.forEach(value => childPaths.push(value));
                } else if (typeof folder.children === 'object') {
                    Object.values(folder.children).forEach(value => childPaths.push(value));
                }
            }
            
            // Eliminar recursivamente cada subcarpeta
            for (const childPath of childPaths) {
                const childFolder = await Folder.findOne({ 
                    department, 
                    path: childPath 
                });
                if (childFolder) {
                    await httpFolder.deleteFolderRecursive(childFolder, department);
                }
            }
            
            // Eliminar la carpeta actual
            await Folder.deleteOne({ _id: folder._id });
            console.log(`   🗑️ Eliminada: ${folder.path}`);
            
        } catch (error) {
            console.error('❌ Error en eliminación recursiva:', error);
            throw error;
        }
    },

    // Obtener items (carpetas y documentos) de una carpeta específica
    getFolderItems: async (req, res, department = 'compras', modelName = 'Compra') => {
        try {
            const folderPath = decodeURIComponent(req.params.folderPath);
            
            // Verificar que la carpeta exista
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
            
            // Obtener subcarpetas
            const childPaths = [];
            if (folder.children) {
                if (folder.children instanceof Map) {
                    folder.children.forEach(value => childPaths.push(value));
                } else if (typeof folder.children === 'object') {
                    Object.values(folder.children).forEach(value => childPaths.push(value));
                }
            }
            
            const childFolders = await Folder.find({
                department,
                path: { $in: childPaths }
            }).lean();
            
            // Formatear carpetas
            const folders = childFolders.map(f => ({
                id: f._id.toString(),
                name: f.name,
                type: 'folder',
                path: f.path,
                createdAt: f.createdAt,
                itemType: 'folder',
                childCount: f.children ? (f.children instanceof Map ? f.children.size : Object.keys(f.children).length) : 0,
                documentCount: f.documents ? f.documents.length : 0
            }));
            
            // Obtener documentos de esta carpeta - usar el modelo dinámicamente
            const Model = mongoose.model(modelName);
            const documents = await Model.find({
                _id: { $in: folder.documents }
            }).lean();
            
            // Formatear documentos
            const formattedDocs = documents.map(doc => ({
                _id: doc._id.toString(),
                documento: doc.documento,
                descripcion: doc.descripcion,
                itemType: 'document',
                tieneArchivos: doc.documentos && doc.documentos.length > 0,
                cantidadArchivos: doc.documentos ? doc.documentos.length : 0,
                createdAt: doc.createdAt,
                documentos: doc.documentos
            }));
            
            return res.status(200).json({
                success: true,
                data: {
                    folders: folders,
                    documents: formattedDocs
                }
            });
            
        } catch (error) {
            console.error('❌ Error obteniendo items:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener items de la carpeta',
                error: error.message
            });
        }
    }
};

export default httpFolder;
