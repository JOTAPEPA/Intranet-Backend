import mongoose from "mongoose";

const riesgosSchema = new mongoose.Schema({
    
    documento: {type: String, required: true},
    descripcion: {
        type: String,
        default: ''
    },
    folderPath: {
        type: String,
        default: '/',
        index: true
    },
    documentos: [{
        originalName: {
            type: String,
            required: true
        },
        fileName: {
            type: String,
            required: true
        },
        filePath: {
            type: String,
            required: true
        },
        downloadURL: {
            type: String,
            required: true
        },
        mimetype: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        uploadDate: {
            type: Date,
            default: Date.now
        },
        firebaseRef: {
            type: String,
            required: true
        }
    }],
    
}, {
    timestamps: true
})

// Índices para búsqueda y filtrado
riesgosSchema.index({ documento: 'text', 'documentos.originalName': 'text' });
riesgosSchema.index({ folderPath: 1, createdAt: -1 });

export default mongoose.model("Riesgos", riesgosSchema);