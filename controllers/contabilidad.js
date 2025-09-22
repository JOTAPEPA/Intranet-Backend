import Contabilidad from '../models/contabilidad.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUtils.js';

const httpContabilidad = {

    postContabilidad: async (req, res) => {
        console.log('🚀 === LLEGÓ AL CONTROLADOR POST CONTABILIDAD ===');

        try {
            const {
                documento,
            } = req.body;

            console.log('=== DEBUG POST CONTABILIDAD ===');
            console.log('req.body:', req.body);
            console.log('req.files:', req.files);
            console.log('Files length:', req.files ? req.files.length : 0);

            // Crear el objeto base de la contabilidad
            const contabilidadData = {
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
                            'contabilidad',
                            'auto'
                        );

                        // Agregar información del archivo al array de documentos
                        contabilidadData.documentos.push({
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

            console.log('=== FINAL CONTABILIDAD DATA ===');
            console.log('contabilidadData:', JSON.stringify(contabilidadData, null, 2));

            const newDocument = new Contabilidad(contabilidadData);
            const savedDocument = await newDocument.save();

            res.status(201).json({
                message: "Contabilidad created successfully",
                savedDocument,
                filesUploaded: contabilidadData.documentos.length
            });

        } catch (error) {
            console.error("Error creating contabilidad:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    getContabilidad: async (req, res) => {
        try {
            const contabilidad = await Contabilidad.find();
            res.json(contabilidad);
        } catch (error) {
            console.error("Error fetching compras:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    getContabilidadById: async (req, res) => {
        try {
            const { id } = req.params;
            const contabilidad = await Contabilidad.findById(id);

            if (!contabilidad) {
                return res.status(404).json({ message: "Contabilidad not found" });
            }

            res.status(200).json({ contabilidad });
        } catch (error) {
            console.error("Error fetching contabilidad:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    deleteContabilidad: async (req, res) => {
        try {
            const { id } = req.params;
            const contabilidad = await Contabilidad.findById(id);

            if (!contabilidad) {
                return res.status(404).json({ message: "Contabilidad not found" });
            }

            // Eliminar archivos de Cloudinary
            if (contabilidad.documentos && contabilidad.documentos.length > 0) {
                for (const documento of contabilidad.documentos) {
                    try {
                        await deleteFromCloudinary(documento.public_id, 'auto');
                        console.log(`Archivo ${documento.originalName} eliminado de Cloudinary`);
                    } catch (deleteError) {
                        console.error(`Error eliminando archivo ${documento.originalName}:`, deleteError);
                    }
                }
            }

            await Contabilidad.findByIdAndDelete(id);
            res.status(200).json({ message: "Contabilidad deleted successfully" });

        } catch (error) {
            console.error("Error deleting contabilidad:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }
}

export default httpContabilidad;
