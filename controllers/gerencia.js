import Gerencia from '../models/gerencia.js';
import { uploadMultipleFilesWithOriginalNames, deleteMultipleFiles } from '../services/firebaseStorage.js';

const httpGerencia = {

    postGerencia: async (req, res) => {
        console.log('🚀 === LLEGÓ AL CONTROLADOR POST GERENCIA ===');
        
        try {
            const { documento } = req.body;

            console.log('📋 Datos recibidos:', {
                documento,
                filesCount: req.files ? req.files.length : 0
            });

            const gerenciaData = {
                documento,
                documentos: []
            };

            if (req.files && req.files.length > 0) {
                console.log(`📤 Procesando ${req.files.length} archivo(s)...`);
                
                try {
                    const uploadedFiles = await uploadMultipleFilesWithOriginalNames(
                        req.files, 
                        'gerencia'
                    );

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
            
            const newDocument = new Gerencia(gerenciaData);
            const savedDocument = await newDocument.save();
            
            console.log('✅ Gerencia guardada exitosamente:', savedDocument._id);
            
            res.status(201).json({ 
                message: "Gerencia creada exitosamente", 
                gerencia: savedDocument,
                filesUploaded: gerenciaData.documentos.length,
                documents: gerenciaData.documentos.map(doc => ({
                    originalName: doc.originalName,
                    downloadURL: doc.downloadURL,
                    size: doc.size
                }))
            });

        } catch (error) {
            console.error("❌ Error en POST gerencia:", error);
            
            if (req.uploadedFiles && req.uploadedFiles.length > 0) {
                try {
                    await deleteMultipleFiles(
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
            const gerencias = await Gerencia.find();
            res.json(gerencias);
        } catch (error) {
            console.error("Error fetching gerencias:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
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

    getFileDownloadURL: async (req, res) => {
        try {
            const { id, fileIndex } = req.params;
            
            const gerencia = await Gerencia.findById(id);
            if (!gerencia) {
                return res.status(404).json({ message: "Documento de gerencia no encontrado" });
            }

            const fileIdx = parseInt(fileIndex);
            if (fileIdx < 0 || fileIdx >= gerencia.documentos.length) {
                return res.status(404).json({ message: "Archivo no encontrado" });
            }

            const documento = gerencia.documentos[fileIdx];
            
            if (!documento.downloadURL) {
                return res.status(404).json({ message: "URL de descarga no disponible" });
            }

            // Redirigir a la URL de descarga de Firebase
            res.redirect(documento.downloadURL);
            
        } catch (error) {
            console.error("❌ Error obteniendo URL de descarga:", error);
            res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    },

    deleteGerencia: async (req, res) => {
        try {
            const { id } = req.params;
            const gerencia = await Gerencia.findById(id);
            if (!gerencia) return res.status(404).json({ message: "Gerencia not found" });

            await Gerencia.findByIdAndDelete(id);
            res.status(200).json({ message: "Gerencia deleted successfully" });
        } catch (error) {
            console.error("Error deleting gerencia:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }
}

export default httpGerencia;
