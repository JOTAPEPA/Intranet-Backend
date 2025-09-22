import TalentoHumano from '../models/talentoHumano.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUtils.js';

const httpTalentoHumano = {

    postTalentoHumano: async (req, res) => {
        console.log('🚀 === LLEGÓ AL CONTROLADOR POST TALENTO HUMANO ===');
        
        try {
            const { documento } = req.body;
            const talentoHumanoData = { documento, documentos: [] };

            if (req.files && req.files.length > 0) {
                console.log(`Procesando ${req.files.length} archivo(s)...`);
                
                for (const file of req.files) {
                    try {
                        const uploadResult = await uploadToCloudinary(file.buffer, 'talento-humano', 'auto');
                        talentoHumanoData.documentos.push({
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

            const newDocument = new TalentoHumano(talentoHumanoData);
            const savedDocument = await newDocument.save();
            
            res.status(201).json({ 
                message: "Talento Humano created successfully", 
                savedDocument,
                filesUploaded: talentoHumanoData.documentos.length
            });

        } catch (error) {
            console.error("Error creating talento humano:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
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
            if (!talentoHumano) return res.status(404).json({ message: "Talento Humano not found" });

            if (talentoHumano.documentos && talentoHumano.documentos.length > 0) {
                for (const documento of talentoHumano.documentos) {
                    try {
                        await deleteFromCloudinary(documento.public_id, 'auto');
                    } catch (deleteError) {
                        console.error(`Error eliminando archivo ${documento.originalName}:`, deleteError);
                    }
                }
            }

            await TalentoHumano.findByIdAndDelete(id);
            res.status(200).json({ message: "Talento Humano deleted successfully" });
        } catch (error) {
            console.error("Error deleting talento humano:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }
}

export default httpTalentoHumano;
