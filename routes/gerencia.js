import { Router } from "express";
import httpGerencia from "../controllers/gerencia.js";
import httpFolder from "../controllers/folder.js";
import upload from "../Middlewares/uploadMiddleware.js";

const router = Router();

const handleMulterError = (err, req, res, next) => {
    console.error('=== MULTER ERROR GERENCIA ===');
    console.error('Error:', err.message);
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'El archivo es demasiado grande', error: err.message });
    if (err.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ message: 'Demasiados archivos', error: err.message });
    if (err.message === 'Tipo de archivo no permitido') return res.status(400).json({ message: 'Tipo de archivo no permitido', error: err.message });
    res.status(500).json({ message: 'Error procesando archivos', error: err.message, code: err.code });
};

// ========== RUTAS DE CARPETAS ==========
router.get('/folders', (req, res) => httpFolder.getFolderStructure(req, res, 'gerencia'));
router.post('/folders', (req, res) => httpFolder.createFolder(req, res, 'gerencia'));
router.delete('/folders/:folderPath', (req, res) => httpFolder.deleteFolder(req, res, 'gerencia'));
router.get('/folders/:folderPath/items', (req, res) => httpFolder.getFolderItems(req, res, 'gerencia', 'Gerencia'));

// ========== RUTAS DE DOCUMENTOS ==========
router.post('/', [upload.array('documentos', 10), handleMulterError], httpGerencia.postGerencia);
router.get('/', httpGerencia.getGerencia);
router.get('/:id', httpGerencia.getGerenciaById);
router.delete('/:id', httpGerencia.deleteGerencia);
router.put('/:documentId/move', httpGerencia.moveDocument);
router.get('/:id/file/:fileIndex/download', httpGerencia.getFileDownloadURL);

export default router;
