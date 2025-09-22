import mongoose from "mongoose";

const gerenciaSchema = new mongoose.Schema({
    
    documento: {type: String, required: true},
    documentos: [{
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        },
        originalName: {
            type: String,
            required: true
        },
        format: {
            type: String,
            required: true
        },
        bytes: {
            type: Number,
            required: true
        },
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    
}, {
    timestamps: true
})

export default mongoose.model("Gerencia", gerenciaSchema);