import { Router } from "express";
import httpRiesgos from "../controllers/riesgos.js";
import httpFolder from "../controllers/folder.js";
import upload from "../Middlewares/uploadMiddleware.js";

const router = Router();

const handleMulterError = (err, req, res, next) => {
    console.error('=== MULTER ERROR RIESGOS ===');
    console.error('Error:', err.message);
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'El archivo es demasiado grande', error: err.message });
    if (err.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ message: 'Demasiados archivos', error: err.message });
    if (err.message === 'Tipo de archivo no permitido') return res.status(400).json({ message: 'Tipo de archivo no permitido', error: err.message });
    res.status(500).json({ message: 'Error procesando archivos', error: err.message, code: err.code });
};

// ========== RUTAS DE CARPETAS ==========
router.get('/folders', (req, res) => httpFolder.getFolderStructure(req, res, 'riesgos'));
router.post('/folders', (req, res) => httpFolder.createFolder(req, res, 'riesgos'));
router.delete('/folders/:folderPath', (req, res) => httpFolder.deleteFolder(req, res, 'riesgos'));
router.get('/folders/:folderPath/items', (req, res) => httpFolder.getFolderItems(req, res, 'riesgos', 'Riesgos'));

// ========== RUTAS DE DOCUMENTOS ==========
router.post('/', [upload.array('documentos', 10), handleMulterError], httpRiesgos.postRiesgos);
router.get('/', httpRiesgos.getRiesgos);
router.get('/:id', httpRiesgos.getRiesgosById);
router.delete('/:id', httpRiesgos.deleteRiesgos);
router.put('/:documentId/move', httpRiesgos.moveDocument);
router.get('/:id/file/:fileIndex/download', httpRiesgos.getFileDownloadURL);

export default router;
