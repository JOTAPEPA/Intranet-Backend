import Riesgos from '../models/riesgos.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUtils.js';

const httpRiesgos = {

    postRiesgos: async (req, res) => {
        console.log('🚀 === LLEGÓ AL CONTROLADOR POST RIESGOS ===');

        try {
            const { documento } = req.body;
            const riesgosData = { documento, documentos: [] };

            if (req.files && req.files.length > 0) {
                console.log(`Procesando ${req.files.length} archivo(s)...`);

                for (const file of req.files) {
                    try {
                        const uploadResult = await uploadToCloudinary(file.buffer, 'riesgos', 'auto');
                        riesgosData.documentos.push({
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

            const newDocument = new Riesgos(riesgosData);
            const savedDocument = await newDocument.save();

            res.status(201).json({
                message: "Riesgos created successfully",
                savedDocument,
                filesUploaded: riesgosData.documentos.length
            });

        } catch (error) {
            console.error("Error creating riesgos:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
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
            if (!riesgos) return res.status(404).json({ message: "Riesgos not found" });

            if (riesgos.documentos && riesgos.documentos.length > 0) {
                for (const documento of riesgos.documentos) {
                    try {
                        await deleteFromCloudinary(documento.public_id, 'auto');
                    } catch (deleteError) {
                        console.error(`Error eliminando archivo ${documento.originalName}:`, deleteError);
                    }
                }
            }

            await Riesgos.findByIdAndDelete(id);
            res.status(200).json({ message: "Riesgos deleted successfully" });
        } catch (error) {
            console.error("Error deleting riesgos:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }
}

export default httpRiesgos;
