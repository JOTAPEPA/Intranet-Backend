import { Router } from "express";
import httpContabilidad from "../controllers/contabilidad.js";
import upload from "../Middlewares/uploadMiddleware.js";

const router = Router();

// Middleware de manejo de errores para Multer
const handleMulterError = (err, req, res, next) => {
    console.error('=== MULTER ERROR CONTABILIDAD ===');
    console.error('Error:', err.message);
    console.error('Error code:', err.code);
    console.error('Field:', err.field);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
            message: 'El archivo es demasiado grande', 
            error: err.message 
        });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ 
            message: 'Demasiados archivos', 
            error: err.message 
        });
    }
    
    if (err.message === 'Tipo de archivo no permitido') {
        return res.status(400).json({ 
            message: 'Tipo de archivo no permitido', 
            error: err.message 
        });
    }
    
    res.status(500).json({ 
        message: 'Error procesando archivos', 
        error: err.message,
        code: err.code
    });
};

// Ruta para crear una nueva contabilidad con archivos adjuntos
router.post('/', [
    upload.array('documentos', 10), // Máximo 10 archivos
    handleMulterError // Manejo de errores de Multer
], httpContabilidad.postContabilidad);

// Ruta para obtener todas las contabilidades
router.get('/', httpContabilidad.getContabilidad);

// Ruta para obtener una contabilidad por ID
router.get('/:id', httpContabilidad.getContabilidadById);

// Ruta para eliminar una contabilidad
router.delete('/:id', httpContabilidad.deleteContabilidad);

export default router;
