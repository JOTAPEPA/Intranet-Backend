import Credito from '../models/credito.js';
import firebaseStorageService from '../services/firebaseStorage.js';

const httpCredito = {

    postCredito: async (req, res) => {
        console.log('🚀 === LLEGÓ AL CONTROLADOR POST CREDITO ===');
        
        try {
            const { documento } = req.body;

            console.log('📋 Datos recibidos:', {
                documento,
                filesCount: req.files ? req.files.length : 0
            });

            // Crear el objeto base del crédito
            const creditoData = {
                documento,
                documentos: []
            };

            // Si hay archivos subidos, subirlos a Firebase Storage
            if (req.files && req.files.length > 0) {
                console.log(`📤 Procesando ${req.files.length} archivo(s)...`);
                
                try {
                    // Subir archivos a Firebase Storage con nombres originales
                    const uploadedFiles = await firebaseStorageService.uploadMultipleFilesWithOriginalNames(
                        req.files, 
                        'credito' // Carpeta específica para documentos de crédito
                    );

                    // Agregar información de los archivos subidos al documento
                    creditoData.documentos = uploadedFiles.map(file => ({
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
            const newDocument = new Credito(creditoData);
            const savedDocument = await newDocument.save();
            
            console.log('✅ Crédito guardado exitosamente:', savedDocument._id);
            
            res.status(201).json({ 
                message: "Crédito creado exitosamente", 
                credito: savedDocument,
                filesUploaded: creditoData.documentos.length,
                documents: creditoData.documentos.map(doc => ({
                    originalName: doc.originalName,
                    downloadURL: doc.downloadURL,
                    size: doc.size
                }))
            });

        } catch (error) {
            console.error("❌ Error en POST crédito:", error);
            
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

    getCredito: async (req, res) => {
        try {
            const credito = await Credito.find();
            res.json(credito);
        } catch (error) {
            console.error("Error fetching credito:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    getCreditoById: async (req, res) => {
        try {
            const { id } = req.params;
            const credito = await Credito.findById(id);
            if (!credito) return res.status(404).json({ message: "Credito not found" });
            res.status(200).json({ credito });
        } catch (error) {
            console.error("Error fetching credito:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    deleteCredito: async (req, res) => {
        try {
            const { id } = req.params;
            const credito = await Credito.findById(id);

            if (!credito) {
                return res.status(404).json({ message: "Crédito no encontrado" });
            }

            // Si el crédito tiene documentos en Firebase, eliminarlos
            if (credito.documentos && credito.documentos.length > 0) {
                try {
                    const filePaths = credito.documentos
                        .filter(doc => doc.filePath) // Solo documentos con filePath
                        .map(doc => doc.filePath);
                    
                    if (filePaths.length > 0) {
                        await firebaseStorageService.deleteMultipleFiles(filePaths);
                        console.log(`🗑️ ${filePaths.length} archivo(s) eliminado(s) de Firebase Storage`);
                    }
                } catch (deleteError) {
                    console.error('❌ Error eliminando archivos de Firebase:', deleteError);
                    // Continuar con la eliminación del documento aunque falle la eliminación de archivos
                }
            }

            await Credito.findByIdAndDelete(id);
            res.status(200).json({ message: "Crédito eliminado exitosamente" });

        } catch (error) {
            console.error("Error eliminando crédito:", error);
            res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    },

    // Nuevo método para obtener URL de descarga de un archivo específico
    getFileDownloadURL: async (req, res) => {
        try {
            const { id, fileIndex } = req.params;
            
            const credito = await Credito.findById(id);
            if (!credito) {
                return res.status(404).json({ message: "Crédito no encontrado" });
            }

            if (!credito.documentos || credito.documentos.length === 0) {
                return res.status(404).json({ message: "No hay documentos asociados a este crédito" });
            }

            const fileIdx = parseInt(fileIndex);
            if (fileIdx < 0 || fileIdx >= credito.documentos.length) {
                return res.status(404).json({ message: "Índice de archivo inválido" });
            }

            const documento = credito.documentos[fileIdx];
            
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
                credito.documentos[fileIdx].downloadURL = downloadURL;
                await credito.save();

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

export default httpCredito;
