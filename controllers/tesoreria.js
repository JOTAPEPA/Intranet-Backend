import Tesoreria from '../models/tesoreria.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUtils.js';

const httpTesoreria = {

    postTesoreria: async (req, res) => {
        console.log('🚀 === LLEGÓ AL CONTROLADOR POST TESORERIA ===');

        try {
            const { documento } = req.body;
            const tesoreriaData = { documento, documentos: [] };

            if (req.files && req.files.length > 0) {
                console.log(`Procesando ${req.files.length} archivo(s)...`);

                for (const file of req.files) {
                    try {
                        const uploadResult = await uploadToCloudinary(file.buffer, 'tesoreria', 'auto');
                        tesoreriaData.documentos.push({
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

            const newDocument = new Tesoreria(tesoreriaData);
            const savedDocument = await newDocument.save();

            res.status(201).json({
                message: "Tesoreria created successfully",
                savedDocument,
                filesUploaded: tesoreriaData.documentos.length
            });

        } catch (error) {
            console.error("Error creating tesoreria:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
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
            if (!tesoreria) return res.status(404).json({ message: "Tesoreria not found" });

            if (tesoreria.documentos && tesoreria.documentos.length > 0) {
                for (const documento of tesoreria.documentos) {
                    try {
                        await deleteFromCloudinary(documento.public_id, 'auto');
                    } catch (deleteError) {
                        console.error(`Error eliminando archivo ${documento.originalName}:`, deleteError);
                    }
                }
            }

            await Tesoreria.findByIdAndDelete(id);
            res.status(200).json({ message: "Tesoreria deleted successfully" });
        } catch (error) {
            console.error("Error deleting tesoreria:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }
}

export default httpTesoreria;
