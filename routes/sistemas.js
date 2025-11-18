import { Router } from "express";
import httpSistema from "../controllers/sistemas.js";
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
router.get('/folders', (req, res) => httpFolder.getFolderStructure(req, res, 'sistemas'));
router.post('/folders', (req, res) => httpFolder.createFolder(req, res, 'sistemas'));
router.delete('/folders/:folderPath', (req, res) => httpFolder.deleteFolder(req, res, 'sistemas'));
router.get('/folders/:folderPath/items', (req, res) => httpFolder.getFolderItems(req, res, 'sistemas', 'Sistema'));

// ========== RUTAS DE DOCUMENTOS ==========
router.post('/', [upload.array('documentos', 10), handleMulterError], httpSistema.postSistema);
router.get('/', httpSistema.getSistemas);
router.get('/:id', httpSistema.getSistemaById);
router.delete('/:id', httpSistema.deleteSistema);
router.put('/:documentId/move', httpSistema.moveDocument);
router.get('/:id/file/:fileIndex/download', httpSistema.getFileDownloadURL);

export default router;