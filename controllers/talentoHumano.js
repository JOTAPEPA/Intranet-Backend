import TalentoHumano from '../models/talentoHumano.js';
import { uploadMultipleFilesWithOriginalNames, deleteFile } from '../services/firebaseStorage.js';

const httpTalentoHumano = {

    postTalentoHumano: async (req, res) => {
        console.log('🚀 === LLEGÓ AL CONTROLADOR POST TALENTO HUMANO ===');
        
        try {
            const { documento } = req.body;
            const talentoHumanoData = { documento, documentos: [] };

            if (req.files && req.files.length > 0) {
                console.log(`📁 Procesando ${req.files.length} archivo(s) para Firebase Storage...`);

                try {
                    // Subir archivos a Firebase Storage con nombres originales
                    const uploadResults = await uploadMultipleFilesWithOriginalNames(req.files, 'talento-humano');
                    console.log('✅ Archivos subidos a Firebase Storage:', uploadResults.length);

                    // Agregar información de Firebase al array de documentos
                    talentoHumanoData.documentos = uploadResults.map(result => ({
                        originalName: result.originalName,
                        fileName: result.fileName,
                        filePath: result.filePath,
                        downloadURL: result.downloadURL,
                        mimetype: result.mimetype,
                        size: result.size,
                        firebaseRef: result.firebaseRef,
                        uploadDate: new Date()
                    }));

                    console.log('📋 Documentos procesados para BD:', talentoHumanoData.documentos.length);

                } catch (uploadError) {
                    console.error('❌ Error subiendo archivos a Firebase:', uploadError);
                    return res.status(500).json({ 
                        message: "Error uploading files to Firebase Storage", 
                        error: uploadError.message 
                    });
                }
            }

            const newDocument = new TalentoHumano(talentoHumanoData);
            const savedDocument = await newDocument.save();

            console.log('✅ Documento de talento humano guardado en BD con ID:', savedDocument._id);
            
            res.status(201).json({ 
                message: "Documento de talento humano creado exitosamente con Firebase Storage", 
                talentoHumano: savedDocument,
                filesUploaded: talentoHumanoData.documentos.length
            });

        } catch (error) {
            console.error("❌ Error creando documento de talento humano:", error);
            res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    },

        getTalentoHumano: async (req, res) => {
        try {
           const talentoHumano = await TalentoHumano.find(); 
           res.json(talentoHumano);   
    } catch (error) {
              console.error("Error fetching talento humano:", error);
              res.status(500).json({ message: "Internal server error", error: error.message });
    }
},

    getTalentoHumanoById: async (req, res) => {
        try {
            const { id } = req.params;
            const talentoHumano = await TalentoHumano.findById(id);
            if (!talentoHumano) return res.status(404).json({ message: "Talento Humano not found" });
            res.status(200).json({ talentoHumano });
        } catch (error) {
            console.error("Error fetching talento humano:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    deleteTalentoHumano: async (req, res) => {
        try {
            const { id } = req.params;
            const talentoHumano = await TalentoHumano.findById(id);
            if (!talentoHumano) return res.status(404).json({ message: "Documento de talento humano no encontrado" });

            // Eliminar archivos de Firebase Storage
            if (talentoHumano.documentos && talentoHumano.documentos.length > 0) {
                console.log(`🗑️ Eliminando ${talentoHumano.documentos.length} archivos de Firebase Storage...`);
                
                for (const documento of talentoHumano.documentos) {
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

            await TalentoHumano.findByIdAndDelete(id);
            console.log('✅ Documento de talento humano eliminado de BD:', id);
            
            res.status(200).json({ message: "Documento de talento humano eliminado exitosamente" });
        } catch (error) {
            console.error("❌ Error eliminando documento de talento humano:", error);
            res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    },

    getFileDownloadURL: async (req, res) => {
        try {
            const { id, fileIndex } = req.params;
            
            const talentoHumano = await TalentoHumano.findById(id);
            if (!talentoHumano) {
                return res.status(404).json({ message: "Documento de talento humano no encontrado" });
            }

            const fileIdx = parseInt(fileIndex);
            if (fileIdx < 0 || fileIdx >= talentoHumano.documentos.length) {
                return res.status(404).json({ message: "Archivo no encontrado" });
            }

            const documento = talentoHumano.documentos[fileIdx];
            
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

export default httpTalentoHumano;
