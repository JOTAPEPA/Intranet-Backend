import Riesgos from '../models/riesgos.js';
import { uploadMultipleFilesWithOriginalNames, deleteFile } from '../services/firebaseStorage.js';

const httpRiesgos = {

    postRiesgos: async (req, res) => {
        console.log('🚀 === LLEGÓ AL CONTROLADOR POST RIESGOS ===');

        try {
            const { documento } = req.body;
            const riesgosData = { documento, documentos: [] };

            if (req.files && req.files.length > 0) {
                console.log(`📁 Procesando ${req.files.length} archivo(s) para Firebase Storage...`);

                try {
                    // Subir archivos a Firebase Storage con nombres originales
                    const uploadResults = await uploadMultipleFilesWithOriginalNames(req.files, 'riesgos');
                    console.log('✅ Archivos subidos a Firebase Storage:', uploadResults.length);

                    // Agregar información de Firebase al array de documentos
                    riesgosData.documentos = uploadResults.map(result => ({
                        originalName: result.originalName,
                        fileName: result.fileName,
                        filePath: result.filePath,
                        downloadURL: result.downloadURL,
                        mimetype: result.mimetype,
                        size: result.size,
                        firebaseRef: result.firebaseRef,
                        uploadDate: new Date()
                    }));

                    console.log('📋 Documentos procesados para BD:', riesgosData.documentos.length);

                } catch (uploadError) {
                    console.error('❌ Error subiendo archivos a Firebase:', uploadError);
                    return res.status(500).json({ 
                        message: "Error uploading files to Firebase Storage", 
                        error: uploadError.message 
                    });
                }
            }

            const newDocument = new Riesgos(riesgosData);
            const savedDocument = await newDocument.save();

            console.log('✅ Documento de riesgos guardado en BD con ID:', savedDocument._id);

            res.status(201).json({
                message: "Documento de riesgos creado exitosamente con Firebase Storage",
                riesgos: savedDocument,
                filesUploaded: riesgosData.documentos.length
            });

        } catch (error) {
            console.error("❌ Error creando documento de riesgos:", error);
            res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    },

    getRiesgos: async (req, res) => {
        try {
            const riesgos = await Riesgos.find();
            res.json(riesgos);
        } catch (error) {
            console.error("Error fetching riesgos:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    getRiesgosById: async (req, res) => {
        try {
            const { id } = req.params;
            const riesgos = await Riesgos.findById(id);
            if (!riesgos) return res.status(404).json({ message: "Riesgos not found" });
            res.status(200).json({ riesgos });
        } catch (error) {
            console.error("Error fetching riesgos:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    deleteRiesgos: async (req, res) => {
        try {
            const { id } = req.params;
            const riesgos = await Riesgos.findById(id);
            if (!riesgos) return res.status(404).json({ message: "Documento de riesgos no encontrado" });

            // Eliminar archivos de Firebase Storage
            if (riesgos.documentos && riesgos.documentos.length > 0) {
                console.log(`🗑️ Eliminando ${riesgos.documentos.length} archivos de Firebase Storage...`);
                
                for (const documento of riesgos.documentos) {
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

            await Riesgos.findByIdAndDelete(id);
            console.log('✅ Documento de riesgos eliminado de BD:', id);
            
            res.status(200).json({ message: "Documento de riesgos eliminado exitosamente" });
        } catch (error) {
            console.error("❌ Error eliminando documento de riesgos:", error);
            res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    },

    getFileDownloadURL: async (req, res) => {
        try {
            const { id, fileIndex } = req.params;
            
            const riesgos = await Riesgos.findById(id);
            if (!riesgos) {
                return res.status(404).json({ message: "Documento de riesgos no encontrado" });
            }

            const fileIdx = parseInt(fileIndex);
            if (fileIdx < 0 || fileIdx >= riesgos.documentos.length) {
                return res.status(404).json({ message: "Archivo no encontrado" });
            }

            const documento = riesgos.documentos[fileIdx];
            
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

export default httpRiesgos;
