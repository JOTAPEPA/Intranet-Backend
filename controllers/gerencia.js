import Gerencia from '../models/gerencia.js';
import Folder from '../models/folder.js';
import firebaseStorageService from '../services/firebaseStorage.js';

const httpGerencia = {

    postGerencia: async (req, res) => {
        console.log('🚀 === LLEGÓ AL CONTROLADOR POST GERENCIA ===');
        
        try {
            const { documento, descripcion = '', folderPath = '/' } = req.body;

            console.log('📋 Datos recibidos:', {
                documento,
                descripcion,
                folderPath,
                filesCount: req.files ? req.files.length : 0
            });

            // Verificar que la carpeta exista
            const folder = await Folder.findOne({ 
                department: 'gerencia', 
                path: folderPath 
            });
            
            if (!folder) {
                return res.status(404).json({
                    success: false,
                    message: 'Carpeta destino no encontrada'
                });
            }

            // Crear el objeto base de gerencia
            const gerenciaData = {
                documento,
                descripcion,
                folderPath,
                documentos: []
            };

            // Si hay archivos subidos, subirlos a Firebase Storage
            if (req.files && req.files.length > 0) {
                console.log(`📤 Procesando ${req.files.length} archivo(s)...`);
                
                try {
                    // Subir archivos a Firebase Storage con nombres originales
                    const uploadedFiles = await firebaseStorageService.uploadMultipleFilesWithOriginalNames(
                        req.files, 
                        'gerencia'
                    );

                    // Agregar información de los archivos subidos al documento
                    gerenciaData.documentos = uploadedFiles.map(file => ({
                        originalName: file.originalName,
                        fileName: file.fileName,
                        filePath: file.filePath,
                        downloadURL: file.downloadURL,
                        mimetype: file.mimetype,
                        size: file.size,
                        uploadDate: file.uploadDate,
                        firebaseRef: file.firebaseRef
                    }));

                    console.log(`✅ ${uploadedFiles.length} archivo(s) subido(s) a Firebase Storage`);

                } catch (uploadError) {
                    console.error('❌ Error subiendo archivos a Firebase:', uploadError);
                    return res.status(500).json({ 
                        message: "Error subiendo archivos", 
                        error: uploadError.message 
                    });
                }
            } else {
                console.log('ℹ️ No se recibieron archivos');
            }

            console.log('💾 Guardando en base de datos...');
            
            // Crear y guardar el documento en la base de datos
            const newDocument = new Gerencia(gerenciaData);
            const savedDocument = await newDocument.save();
            
            // Actualizar carpeta - agregar documento
            folder.documents.push(savedDocument._id);
            await folder.save();
            
            console.log('✅ Gerencia guardada exitosamente:', savedDocument._id);
            console.log('✅ Carpeta actualizada con el nuevo documento');
            
            res.status(201).json({ 
                success: true,
                message: "Gerencia creada exitosamente", 
                data: savedDocument,
                filesUploaded: gerenciaData.documentos.length,
                documents: gerenciaData.documentos.map(doc => ({
                    originalName: doc.originalName,
                    downloadURL: doc.downloadURL,
                    size: doc.size
                }))
            });

        } catch (error) {
            console.error("❌ Error en POST gerencia:", error);
            
            // Si hay un error y ya se subieron archivos, intentar limpiarlos
            if (req.uploadedFiles && req.uploadedFiles.length > 0) {
                try {
                    await firebaseStorageService.deleteMultipleFiles(
                        req.uploadedFiles.map(file => file.filePath)
                    );
                    console.log('🧹 Archivos limpiados después del error');
                } catch (cleanupError) {
                    console.error('❌ Error limpiando archivos:', cleanupError);
                }
            }
            
            if (!res.headersSent) {
                res.status(500).json({ 
                    message: "Error interno del servidor", 
                    error: error.message 
                });
            }
        }
    },

    getGerencia: async (req, res) => {
        try {
            const { folderId, search } = req.query;
            
            let query = {};
            
            // Filtrar por carpeta si se especifica
            if (folderId) {
                query.folderPath = folderId;
            }
            
            // Búsqueda por texto si se especifica
            if (search) {
                query.$or = [
                    { documento: { $regex: search, $options: 'i' } },
                    { descripcion: { $regex: search, $options: 'i' } },
                    { 'documentos.originalName': { $regex: search, $options: 'i' } }
                ];
            }
            
            const gerencias = await Gerencia.find(query).sort({ createdAt: -1 });
            
            // Agregar propiedades calculadas
            const gerenciasFormatted = gerencias.map(ger => ({
                ...ger.toObject(),
                tieneArchivos: ger.documentos && ger.documentos.length > 0,
                cantidadArchivos: ger.documentos ? ger.documentos.length : 0
            }));
            
            res.status(200).json({
                success: true,
                data: gerenciasFormatted
            });
        } catch (error) {
            console.error("Error fetching gerencias:", error);
            res.status(500).json({ 
                success: false,
                message: "Internal server error", 
                error: error.message 
            });
        }
    },

    getGerenciaById: async (req, res) => {
        try {
            const { id } = req.params;
            const gerencia = await Gerencia.findById(id);
            if (!gerencia) return res.status(404).json({ message: "Gerencia not found" });
            res.status(200).json({ gerencia });
        } catch (error) {
            console.error("Error fetching gerencia:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    deleteGerencia: async (req, res) => {
        try {
            const { id } = req.params;
            const gerencia = await Gerencia.findById(id);

            if (!gerencia) {
                return res.status(404).json({ 
                    success: false,
                    message: "Gerencia no encontrada" 
                });
            }

            // Si gerencia tiene documentos en Firebase, eliminarlos
            if (gerencia.documentos && gerencia.documentos.length > 0) {
                try {
                    const filePaths = gerencia.documentos
                        .filter(doc => doc.filePath)
                        .map(doc => doc.filePath);
                    
                    if (filePaths.length > 0) {
                        await firebaseStorageService.deleteMultipleFiles(filePaths);
                        console.log(`🗑️ ${filePaths.length} archivo(s) eliminado(s) de Firebase Storage`);
                    }
                } catch (deleteError) {
                    console.error('❌ Error eliminando archivos de Firebase:', deleteError);
                }
            }

            // Remover documento de su carpeta
            const folder = await Folder.findOne({ 
                department: 'gerencia', 
                path: gerencia.folderPath || '/'
            });
            
            if (folder) {
                folder.documents = folder.documents.filter(
                    docId => docId.toString() !== id
                );
                await folder.save();
                console.log('✅ Documento removido de la carpeta');
            }

            await Gerencia.findByIdAndDelete(id);
            res.status(200).json({ 
                success: true,
                message: "Gerencia eliminada exitosamente" 
            });

        } catch (error) {
            console.error("Error eliminando gerencia:", error);
            res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    },

    // Mover documento a otra carpeta
    moveDocument: async (req, res) => {
        try {
            const { documentId } = req.params;
            const { targetFolderPath } = req.body;
            const department = 'gerencia';
            
            if (!targetFolderPath) {
                return res.status(400).json({
                    success: false,
                    message: 'Carpeta destino requerida'
                });
            }
            
            // Buscar documento
            const document = await Gerencia.findById(documentId);
            
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
            
            console.log(`✅ Documento movido de ${sourceFolderPath} a ${targetFolderPath}`);
            
            return res.status(200).json({
                success: true,
                message: 'Documento movido exitosamente',
                data: document
            });
            
        } catch (error) {
            console.error('❌ Error al mover documento:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al mover documento',
                error: error.message
            });
        }
    },

    getFileDownloadURL: async (req, res) => {
        try {
            const { id, fileIndex } = req.params;
            
            const gerencia = await Gerencia.findById(id);
            if (!gerencia) {
                return res.status(404).json({ message: "Gerencia no encontrada" });
            }

            if (!gerencia.documentos || gerencia.documentos.length === 0) {
                return res.status(404).json({ message: "No hay documentos asociados a esta gerencia" });
            }

            const fileIdx = parseInt(fileIndex);
            if (fileIdx < 0 || fileIdx >= gerencia.documentos.length) {
                return res.status(404).json({ message: "Índice de archivo inválido" });
            }

            const documento = gerencia.documentos[fileIdx];
            
            // Si ya tiene downloadURL, devolverlo directamente
            if (documento.downloadURL) {
                return res.status(200).json({
                    downloadURL: documento.downloadURL,
                    fileName: documento.originalName,
                    size: documento.size,
                    mimetype: documento.mimetype
                });
            }

            // Si no tiene downloadURL pero tiene filePath, generarlo
            if (documento.filePath) {
                const downloadURL = await firebaseStorageService.getFileDownloadURL(documento.filePath);
                
                // Opcional: actualizar el documento con la nueva URL
                gerencia.documentos[fileIdx].downloadURL = downloadURL;
                await gerencia.save();

                return res.status(200).json({
                    downloadURL: downloadURL,
                    fileName: documento.originalName,
                    size: documento.size,
                    mimetype: documento.mimetype
                });
            }

            return res.status(404).json({ message: "Archivo no encontrado en el almacenamiento" });

        } catch (error) {
            console.error("Error obteniendo URL de descarga:", error);
            res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    }
}

export default httpGerencia;
