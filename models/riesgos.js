import mongoose from "mongoose";

const riesgosSchema = new mongoose.Schema({
    
    documento: {type: String, required: true},
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

export default mongoose.model("Riesgos", riesgosSchema);