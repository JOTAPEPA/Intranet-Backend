import mongoose from "mongoose";

const sistemasSchema = new mongoose.Schema({
    
    documento: {type: String,},
    documentos: [{
        // Información del archivo original
        originalName: {
            type: String,
            required: true
        },
        // Nombre único generado en Firebase
        fileName: {
            type: String,
            required: true
        },
        // Ruta completa en Firebase Storage
        filePath: {
            type: String,
            required: true
        },
        // URL de descarga directa de Firebase
        downloadURL: {
            type: String,
            required: true
        },
        // Tipo MIME del archivo
        mimetype: {
            type: String,
            required: true
        },
        // Tamaño del archivo en bytes
        size: {
            type: Number,
            required: true
        },
        // Fecha de subida
        uploadDate: {
            type: Date,
            default: Date.now
        },
        // Referencia de Firebase para operaciones avanzadas
        firebaseRef: {
            type: String,
            required: true
        }
    }],
    
}, {
    timestamps: true
})

export default mongoose.model("Sistema", sistemasSchema);