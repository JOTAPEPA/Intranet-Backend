import { Router } from "express";
import httpTesoreria from "../controllers/tesoreria.js";
import httpFolder from "../controllers/folder.js";
import upload from "../Middlewares/uploadMiddleware.js";

const router = Router();

const handleMulterError = (err, req, res, next) => {
    console.error('=== MULTER ERROR TESORERIA ===');
    console.error('Error:', err.message);
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'El archivo es demasiado grande', error: err.message });
    if (err.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ message: 'Demasiados archivos', error: err.message });
    if (err.message === 'Tipo de archivo no permitido') return res.status(400).json({ message: 'Tipo de archivo no permitido', error: err.message });
    res.status(500).json({ message: 'Error procesando archivos', error: err.message, code: err.code });
};

// ========== RUTAS DE CARPETAS ==========
router.get('/folders', (req, res) => httpFolder.getFolderStructure(req, res, 'tesoreria'));
router.post('/folders', (req, res) => httpFolder.createFolder(req, res, 'tesoreria'));
router.delete('/folders/:folderPath', (req, res) => httpFolder.deleteFolder(req, res, 'tesoreria'));
router.get('/folders/:folderPath/items', (req, res) => httpFolder.getFolderItems(req, res, 'tesoreria', 'Tesoreria'));

// ========== RUTAS DE DOCUMENTOS ==========
router.post('/', [upload.array('documentos', 10), handleMulterError], httpTesoreria.postTesoreria);
router.get('/', httpTesoreria.getTesoreria);
router.get('/:id', httpTesoreria.getTesoreriaById);
router.delete('/:id', httpTesoreria.deleteTesoreria);
router.put('/:documentId/move', httpTesoreria.moveDocument);
router.get('/:id/file/:fileIndex/download', httpTesoreria.getFileDownloadURL);

export default router;
