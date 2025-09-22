import Gerencia from '../models/gerencia.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUtils.js';

const httpGerencia = {

    postGerencia: async (req, res) => {
        console.log('🚀 === LLEGÓ AL CONTROLADOR POST GERENCIA ===');

        try {
            const { documento } = req.body;
            const gerenciaData = { documento, documentos: [] };

            if (req.files && req.files.length > 0) {
                console.log(`Procesando ${req.files.length} archivo(s)...`);

                for (const file of req.files) {
                    try {
                        const uploadResult = await uploadToCloudinary(file.buffer, 'gerencia', 'auto');
                        gerenciaData.documentos.push({
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
            }

            const newDocument = new Gerencia(gerenciaData);
            const savedDocument = await newDocument.save();

            res.status(201).json({
                message: "Gerencia created successfully",
                savedDocument,
                filesUploaded: gerenciaData.documentos.length
            });

        } catch (error) {
            console.error("Error creating gerencia:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
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

    deleteGerencia: async (req, res) => {
        try {
            const { id } = req.params;
            const gerencia = await Gerencia.findById(id);
            if (!gerencia) return res.status(404).json({ message: "Gerencia not found" });

            if (gerencia.documentos && gerencia.documentos.length > 0) {
                for (const documento of gerencia.documentos) {
                    try {
                        await deleteFromCloudinary(documento.public_id, 'auto');
                    } catch (deleteError) {
                        console.error(`Error eliminando archivo ${documento.originalName}:`, deleteError);
                    }
                }
            }

            await Gerencia.findByIdAndDelete(id);
            res.status(200).json({ message: "Gerencia deleted successfully" });
        } catch (error) {
            console.error("Error deleting gerencia:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }
}

export default httpGerencia;
