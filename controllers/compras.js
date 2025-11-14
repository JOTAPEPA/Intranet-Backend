import compras from '../models/compras.js';
import Compra from '../models/compras.js';
import firebaseStorageService from '../services/firebaseStorage.js';

const httpCompra = {

    postCompra: async (req, res) => {
        console.log('🚀 === LLEGÓ AL CONTROLADOR POST COMPRA ===');
        
        try {
            const { documento } = req.body;

            console.log('📋 Datos recibidos:', {
                documento,
                filesCount: req.files ? req.files.length : 0
            });

            // Crear el objeto base de la compra
            const compraData = {
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
                        'compras' // Carpeta específica para documentos de compras
                    );

                    // Agregar información de los archivos subidos al documento
                    compraData.documentos = uploadedFiles.map(file => ({
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
            const newDocument = new Compra(compraData);
            const savedDocument = await newDocument.save();
            
            console.log('✅ Compra guardada exitosamente:', savedDocument._id);
            
            res.status(201).json({ 
                message: "Compra creada exitosamente", 
                data: savedDocument,
                filesUploaded: compraData.documentos.length,
                documents: compraData.documentos.map(doc => ({
                    originalName: doc.originalName,
                    downloadURL: doc.downloadURL,
                    size: doc.size
                }))
            });

        } catch (error) {
            console.error("❌ Error en POST compra:", error);
            
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

    getCompras: async (req, res) => {
        try {
           const compras = await Compra.find(); 
           res.json(compras);   
    } catch (error) {
              console.error("Error fetching compras:", error);
              res.status(500).json({ message: "Internal server error", error: error.message });
    }
},

    getCompraById: async (req, res) => {
        try {
            const { id } = req.params;
            const compra = await Compra.findById(id);
            
            if (!compra) {
                return res.status(404).json({ message: "Compra not found" });
            }
            
            res.status(200).json({ compra });
        } catch (error) {
            console.error("Error fetching compra:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    deleteCompra: async (req, res) => {
        try {
            const { id } = req.params;
            const compra = await Compra.findById(id);

            if (!compra) {
                return res.status(404).json({ message: "Compra no encontrada" });
            }

            // Si la compra tiene documentos en Firebase, eliminarlos
            if (compra.documentos && compra.documentos.length > 0) {
                try {
                    const filePaths = compra.documentos
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

            await Compra.findByIdAndDelete(id);
            res.status(200).json({ message: "Compra eliminada exitosamente" }); 
            
        } catch (error) {
            console.error("Error eliminando compra:", error);
            res.status(500).json({ message: "Error interno del servidor", error: error.message });
        }
    },

    // Nuevo método para obtener URL de descarga de un archivo específico
    getFileDownloadURL: async (req, res) => {
        try {
            const { id, fileIndex } = req.params;
            
            const compra = await Compra.findById(id);
            if (!compra) {
                return res.status(404).json({ message: "Compra no encontrada" });
            }

            if (!compra.documentos || compra.documentos.length === 0) {
                return res.status(404).json({ message: "No hay documentos asociados a esta compra" });
            }

            const fileIdx = parseInt(fileIndex);
            if (fileIdx < 0 || fileIdx >= compra.documentos.length) {
                return res.status(404).json({ message: "Índice de archivo inválido" });
            }

            const documento = compra.documentos[fileIdx];
            
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
                compra.documentos[fileIdx].downloadURL = downloadURL;
                await compra.save();

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

export default httpCompra;