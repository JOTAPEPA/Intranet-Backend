import Credito from '../models/credito.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUtils.js';

const httpCredito = {

    postCredito: async (req, res) => {
        console.log('🚀 === LLEGÓ AL CONTROLADOR POST CREDITO ===');

        try {
            const { documento } = req.body;
            const creditoData = { documento, documentos: [] };

            if (req.files && req.files.length > 0) {
                console.log(`Procesando ${req.files.length} archivo(s)...`);

                for (const file of req.files) {
                    try {
                        const uploadResult = await uploadToCloudinary(file.buffer, 'credito', 'auto');
                        creditoData.documentos.push({
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

            const newDocument = new Credito(creditoData);
            const savedDocument = await newDocument.save();

            res.status(201).json({
                message: "Credito created successfully",
                savedDocument,
                filesUploaded: creditoData.documentos.length
            });

        } catch (error) {
            console.error("Error creating credito:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    getCredito: async (req, res) => {
        try {
            const credito = await Credito.find();
            res.json(credito);
        } catch (error) {
            console.error("Error fetching credito:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    getCreditoById: async (req, res) => {
        try {
            const { id } = req.params;
            const credito = await Credito.findById(id);
            if (!credito) return res.status(404).json({ message: "Credito not found" });
            res.status(200).json({ credito });
        } catch (error) {
            console.error("Error fetching credito:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    deleteCredito: async (req, res) => {
        try {
            const { id } = req.params;
            const credito = await Credito.findById(id);
            if (!credito) return res.status(404).json({ message: "Credito not found" });

            if (credito.documentos && credito.documentos.length > 0) {
                for (const documento of credito.documentos) {
                    try {
                        await deleteFromCloudinary(documento.public_id, 'auto');
                    } catch (deleteError) {
                        console.error(`Error eliminando archivo ${documento.originalName}:`, deleteError);
                    }
                }
            }

            await Credito.findByIdAndDelete(id);
            res.status(200).json({ message: "Credito deleted successfully" });
        } catch (error) {
            console.error("Error deleting credito:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }
}

export default httpCredito;
