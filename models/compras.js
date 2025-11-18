    import mongoose from "mongoose";

    const comprasSchema = new mongoose.Schema({
        
        documento: {type: String,},
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

    // Índices para búsqueda y filtrado
    comprasSchema.index({ documento: 'text', 'documentos.originalName': 'text' });
    comprasSchema.index({ folderPath: 1, createdAt: -1 });

    export default mongoose.model("Compra", comprasSchema);