import ControlInterno from '../models/controlInterno.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUtils.js';

const httpControlInterno = {

    postControlInterno: async (req, res) => {
        console.log('🚀 === LLEGÓ AL CONTROLADOR POST CONTROL INTERNO ===');

        try {
            const {
                documento,
            } = req.body;

            console.log('=== DEBUG POST CONTROL INTERNO ===');
            console.log('req.body:', req.body);
            console.log('req.files:', req.files);
            console.log('Files length:', req.files ? req.files.length : 0);

            // Crear el objeto base del control interno
            const controlInternoData = {
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
                            'control-interno',
                            'auto'
                        );

                        // Agregar información del archivo al array de documentos
                        controlInternoData.documentos.push({
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
            }

            console.log('=== FINAL CONTROL INTERNO DATA ===');
            console.log('controlInternoData:', JSON.stringify(controlInternoData, null, 2));

            const newDocument = new ControlInterno(controlInternoData);
            const savedDocument = await newDocument.save();

            res.status(201).json({
                message: "Control Interno created successfully",
                savedDocument,
                filesUploaded: controlInternoData.documentos.length
            });

        } catch (error) {
            console.error("Error creating control interno:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
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
                return res.status(404).json({ message: "Control Interno not found" });
            }

            // Eliminar archivos de Cloudinary
            if (controlInterno.documentos && controlInterno.documentos.length > 0) {
                for (const documento of controlInterno.documentos) {
                    try {
                        await deleteFromCloudinary(documento.public_id, 'auto');
                        console.log(`Archivo ${documento.originalName} eliminado de Cloudinary`);
                    } catch (deleteError) {
                        console.error(`Error eliminando archivo ${documento.originalName}:`, deleteError);
                    }
                }
            }

            await ControlInterno.findByIdAndDelete(id);
            res.status(200).json({ message: "Control Interno deleted successfully" });

        } catch (error) {
            console.error("Error deleting control interno:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }
}

export default httpControlInterno;
