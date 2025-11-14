import Tesoreria from '../models/tesoreria.js';
import { uploadMultipleFilesWithOriginalNames, deleteFile } from '../services/firebaseStorage.js';

const httpTesoreria = {

    postTesoreria: async (req, res) => {
        console.log('🚀 === LLEGÓ AL CONTROLADOR POST TESORERIA ===');

        try {
            const { documento } = req.body;
            const tesoreriaData = { documento, documentos: [] };

            if (req.files && req.files.length > 0) {
                console.log(`📁 Procesando ${req.files.length} archivo(s) para Firebase Storage...`);

                try {
                    // Subir archivos a Firebase Storage con nombres originales
                    const uploadResults = await uploadMultipleFilesWithOriginalNames(req.files, 'tesoreria');
                    console.log('✅ Archivos subidos a Firebase Storage:', uploadResults.length);

                    // Agregar información de Firebase al array de documentos
                    tesoreriaData.documentos = uploadResults.map(result => ({
                        originalName: result.originalName,
                        fileName: result.fileName,
                        filePath: result.filePath,
                        downloadURL: result.downloadURL,
                        mimetype: result.mimetype,
                        size: result.size,
                        firebaseRef: result.firebaseRef,
                        uploadDate: new Date()
                    }));

                    console.log('📋 Documentos procesados para BD:', tesoreriaData.documentos.length);

                } catch (uploadError) {
                    console.error('❌ Error subiendo archivos a Firebase:', uploadError);
                    return res.status(500).json({ 
                        message: "Error uploading files to Firebase Storage", 
                        error: uploadError.message 
                    });
                }
            }

            const newDocument = new Tesoreria(tesoreriaData);
            const savedDocument = await newDocument.save();

            console.log('✅ Documento de tesorería guardado en BD con ID:', savedDocument._id);

            res.status(201).json({
                message: "Documento de tesorería creado exitosamente con Firebase Storage",
                tesoreria: savedDocument,
                filesUploaded: tesoreriaData.documentos.length
            });

        } catch (error) {
            console.error("❌ Error creando documento de tesorería:", error);
            res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    },

    getTesoreria: async (req, res) => {
        try {
            const tesoreria = await Tesoreria.find();
            res.json(tesoreria);
        } catch (error) {
            console.error("Error fetching tesoreria:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    getTesoreriaById: async (req, res) => {
        try {
            const { id } = req.params;
            const tesoreria = await Tesoreria.findById(id);
            if (!tesoreria) return res.status(404).json({ message: "Tesoreria not found" });
            res.status(200).json({ tesoreria });
        } catch (error) {
            console.error("Error fetching tesoreria:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    deleteTesoreria: async (req, res) => {
        try {
            const { id } = req.params;
            const tesoreria = await Tesoreria.findById(id);
            if (!tesoreria) return res.status(404).json({ message: "Documento de tesorería no encontrado" });

            // Eliminar archivos de Firebase Storage
            if (tesoreria.documentos && tesoreria.documentos.length > 0) {
                console.log(`🗑️ Eliminando ${tesoreria.documentos.length} archivos de Firebase Storage...`);
                
                for (const documento of tesoreria.documentos) {
                    try {
                        if (documento.firebaseRef) {
                            await deleteFile(documento.firebaseRef);
                            console.log(`✅ Archivo eliminado de Firebase: ${documento.firebaseRef}`);
                        }
                    } catch (deleteError) {
                        console.error(`❌ Error eliminando archivo ${documento.firebaseRef}:`, deleteError.message);
                        // Continuar con otros archivos aunque uno falle
                    }
                }
            }

            await Tesoreria.findByIdAndDelete(id);
            console.log('✅ Documento de tesorería eliminado de BD:', id);
            
            res.status(200).json({ message: "Documento de tesorería eliminado exitosamente" });
        } catch (error) {
            console.error("❌ Error eliminando documento de tesorería:", error);
            res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    },

    getFileDownloadURL: async (req, res) => {
        try {
            const { id, fileIndex } = req.params;
            
            const tesoreria = await Tesoreria.findById(id);
            if (!tesoreria) {
                return res.status(404).json({ message: "Documento de tesorería no encontrado" });
            }

            const fileIdx = parseInt(fileIndex);
            if (fileIdx < 0 || fileIdx >= tesoreria.documentos.length) {
                return res.status(404).json({ message: "Archivo no encontrado" });
            }

            const documento = tesoreria.documentos[fileIdx];
            
            if (!documento.downloadURL) {
                return res.status(404).json({ message: "URL de descarga no disponible" });
            }

            // Redirigir a la URL de descarga de Firebase
            res.redirect(documento.downloadURL);
            
        } catch (error) {
            console.error("❌ Error obteniendo URL de descarga:", error);
            res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    }
}

export default httpTesoreria;
