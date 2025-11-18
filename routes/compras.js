import { Router } from "express";
import httpCompra from "../controllers/compras.js";
import httpFolder from "../controllers/folder.js";
import upload from "../Middlewares/uploadMiddleware.js";

const router = Router();

// Middleware de manejo de errores para Multer
const handleMulterError = (err, req, res, next) => {
    console.error('=== MULTER ERROR ===');
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


// ========== RUTAS DE CARPETAS ==========
router.get('/folders', (req, res) => httpFolder.getFolderStructure(req, res, 'compras'));
router.post('/folders', (req, res) => httpFolder.createFolder(req, res, 'compras'));
router.delete('/folders/:folderPath', (req, res) => httpFolder.deleteFolder(req, res, 'compras'));
router.get('/folders/:folderPath/items', (req, res) => httpFolder.getFolderItems(req, res, 'compras', 'Compra'));

// ========== RUTAS DE DOCUMENTOS ==========
router.post('/', [
    upload.array('documentos', 10),
    handleMulterError 
], httpCompra.postCompra);

router.get('/', httpCompra.getCompras);
router.get('/:id', httpCompra.getCompraById);
router.delete('/:id', httpCompra.deleteCompra);

// Mover documento a otra carpeta
router.put('/:documentId/move', httpCompra.moveDocument);

// Obtener URL de descarga de un archivo específico
router.get('/:id/file/:fileIndex/download', httpCompra.getFileDownloadURL);

export default router;