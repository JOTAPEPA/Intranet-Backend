import ControlInterno from '../models/controlInterno.js';
import firebaseStorageService from '../services/firebaseStorage.js';

const httpControlInterno = {

    postControlInterno: async (req, res) => {
        console.log('🚀 === LLEGÓ AL CONTROLADOR POST CONTROL INTERNO ===');
        
        try {
            const { documento } = req.body;

            console.log('📋 Datos recibidos:', {
                documento,
                filesCount: req.files ? req.files.length : 0
            });

            // Crear el objeto base del control interno
            const controlInternoData = {
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
                        'control-interno' // Carpeta específica para documentos de control interno
                    );

                    // Agregar información de los archivos subidos al documento
                    controlInternoData.documentos = uploadedFiles.map(file => ({
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
            const newDocument = new ControlInterno(controlInternoData);
            const savedDocument = await newDocument.save();
            
            console.log('✅ Control Interno guardado exitosamente:', savedDocument._id);
            
            res.status(201).json({ 
                message: "Control Interno creado exitosamente", 
                controlInterno: savedDocument,
                filesUploaded: controlInternoData.documentos.length,
                documents: controlInternoData.documentos.map(doc => ({
                    originalName: doc.originalName,
                    downloadURL: doc.downloadURL,
                    size: doc.size
                }))
            });

        } catch (error) {
            console.error("❌ Error en POST control interno:", error);
            
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

    getControlInterno: async (req, res) => {
        try {
            const controlInterno = await ControlInterno.find();
            res.json(controlInterno);
        } catch (error) {
            console.error("Error fetching control interno:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    getControlInternoById: async (req, res) => {
        try {
            const { id } = req.params;
            const controlInterno = await ControlInterno.findById(id);

            if (!controlInterno) {
                return res.status(404).json({ message: "Control Interno not found" });
            }

            res.status(200).json({ controlInterno });
        } catch (error) {
            console.error("Error fetching control interno:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    deleteControlInterno: async (req, res) => {
        try {
            const { id } = req.params;
            const controlInterno = await ControlInterno.findById(id);

            if (!controlInterno) {
                return res.status(404).json({ message: "Control Interno no encontrado" });
            }

            // Si el control interno tiene documentos en Firebase, eliminarlos
            if (controlInterno.documentos && controlInterno.documentos.length > 0) {
                try {
                    const filePaths = controlInterno.documentos
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

            await ControlInterno.findByIdAndDelete(id);
            res.status(200).json({ message: "Control Interno eliminado exitosamente" });

        } catch (error) {
            console.error("Error eliminando control interno:", error);
            res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    },

    // Nuevo método para obtener URL de descarga de un archivo específico
    getFileDownloadURL: async (req, res) => {
        try {
            const { id, fileIndex } = req.params;
            
            const controlInterno = await ControlInterno.findById(id);
            if (!controlInterno) {
                return res.status(404).json({ message: "Control Interno no encontrado" });
            }

            if (!controlInterno.documentos || controlInterno.documentos.length === 0) {
                return res.status(404).json({ message: "No hay documentos asociados a este control interno" });
            }

            const fileIdx = parseInt(fileIndex);
            if (fileIdx < 0 || fileIdx >= controlInterno.documentos.length) {
                return res.status(404).json({ message: "Índice de archivo inválido" });
            }

            const documento = controlInterno.documentos[fileIdx];
            
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
                controlInterno.documentos[fileIdx].downloadURL = downloadURL;
                await controlInterno.save();

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

export default httpControlInterno;
