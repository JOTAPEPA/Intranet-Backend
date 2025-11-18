import mongoose from 'mongoose';

const FolderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
        validate: {
            validator: function(v) {
                return !/[<>:"/\\|?*]/.test(v);
            },
            message: 'Nombre contiene caracteres no permitidos'
        }
    },
    path: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        default: 'folder',
        immutable: true
    },
    parent: {
        type: String,
        default: null,
        index: true
    },
    children: {
        type: Map,
        of: String,
        default: {}
    },
    documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Compra'
    }],
    department: {
        type: String,
        required: true,
        enum: ['compras', 'contabilidad', 'credito', 'tesoreria', 'riesgos', 'sistemas', 'talentoHumano', 'controlInterno', 'gerencia'],
        default: 'compras'
    }
}, {
    timestamps: true
});

// Índices compuestos para búsquedas eficientes
// Path debe ser único por departamento (no globalmente)
FolderSchema.index({ department: 1, path: 1 }, { unique: true });
FolderSchema.index({ department: 1, parent: 1 });

export default mongoose.model('Folder', FolderSchema);
