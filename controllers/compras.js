import compras from '../models/compras.js';
import Compra from '../models/compras.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUtils.js';

const httpCompra = {

    postCompra: async (req, res) => {
        console.log('🚀 === LLEGÓ AL CONTROLADOR POST COMPRA ===');
        
        try {
            const {
                documento,
            } = req.body;

            console.log('=== DEBUG POST COMPRA ===');
            console.log('req.body:', req.body);
            console.log('req.files:', req.files);
            console.log('Files length:', req.files ? req.files.length : 0);

            // Crear el objeto base de la compra
            const compraData = {
                documento,
                documentos: []
            };

            // Si hay archivos subidos, procesarlos
            if (req.files && req.files.length > 0) {
                console.log(`Procesando ${req.files.length} archivo(s)...`);
                
                // Subir cada archivo a Cloudinary
                for (const file of req.files) {
                    console.log('Processing file:', {
                        originalname: file.originalname,
                        mimetype: file.mimetype,
                        size: file.size,
                        bufferLength: file.buffer ? file.buffer.length : 'undefined'
                    });
                    
                    try {
                        const uploadResult = await uploadToCloudinary(
                            file.buffer,
                            'compras',
                            'auto'
                        );

                        // Agregar información del archivo al array de documentos
                        compraData.documentos.push({
                            url: uploadResult.url,
                            public_id: uploadResult.public_id,
                            originalName: file.originalname,
                            format: uploadResult.format,
                            bytes: uploadResult.bytes
                        });

                        console.log(`Archivo ${file.originalname} subido exitosamente`);
                    } catch (uploadError) {
                        console.error(`Error subiendo archivo ${file.originalname}:`, uploadError);
                        return res.status(500).json({ 
                            message: `Error subiendo archivo ${file.originalname}`,
                            error: uploadError.message 
                        });
                    }
                }
            } else {
                console.log('=== NO FILES DETECTED ===');
                console.log('req.files is:', req.files);
                console.log('req.file is:', req.file);
                console.log('Available req properties:', Object.keys(req));
            }

            console.log('=== FINAL COMPRA DATA ===');
            console.log('compraData:', JSON.stringify(compraData, null, 2));
            
            const newDocument = new Compra(compraData);
            const savedDocument = await newDocument.save();
            
            res.status(201).json({ 
                message: "Compra created successfully", 
                savedDocument,
                filesUploaded: compraData.documentos.length
            });

        } catch (error) {
            console.error("Error creating compra:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
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
                return res.status(404).json({ message: "Compra not found" });
            }

            // Eliminar archivos de Cloudinary
            if (compra.documentos && compra.documentos.length > 0) {
                for (const documento of compra.documentos) {
                    try {
                        await deleteFromCloudinary(documento.public_id, 'auto');
                        console.log(`Archivo ${documento.originalName} eliminado de Cloudinary`);
                    } catch (deleteError) {
                        console.error(`Error eliminando archivo ${documento.originalName}:`, deleteError);
                    }
                }
            }

            await Compra.findByIdAndDelete(id);
            res.status(200).json({ message: "Compra deleted successfully" });
            
        } catch (error) {
            console.error("Error deleting compra:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }
}

export default httpCompra;