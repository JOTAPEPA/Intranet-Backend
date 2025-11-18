import { Router } from "express";
import httpCredito from "../controllers/credito.js";
import httpFolder from "../controllers/folder.js";
import upload from "../Middlewares/uploadMiddleware.js";

const router = Router();

const handleMulterError = (err, req, res, next) => {
    console.error('=== MULTER ERROR CREDITO ===');
    console.error('Error:', err.message);
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'El archivo es demasiado grande', error: err.message });
    if (err.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ message: 'Demasiados archivos', error: err.message });
    if (err.message === 'Tipo de archivo no permitido') return res.status(400).json({ message: 'Tipo de archivo no permitido', error: err.message });
    res.status(500).json({ message: 'Error procesando archivos', error: err.message, code: err.code });
};

// ========== RUTAS DE CARPETAS ==========
router.get('/folders', (req, res) => httpFolder.getFolderStructure(req, res, 'credito'));
router.post('/folders', (req, res) => httpFolder.createFolder(req, res, 'credito'));
router.delete('/folders/:folderPath', (req, res) => httpFolder.deleteFolder(req, res, 'credito'));
router.get('/folders/:folderPath/items', (req, res) => httpFolder.getFolderItems(req, res, 'credito', 'Credito'));

// ========== RUTAS DE DOCUMENTOS ==========
router.post('/', [upload.array('documentos', 10), handleMulterError], httpCredito.postCredito);
router.get('/', httpCredito.getCredito);
router.get('/:id', httpCredito.getCreditoById);
router.delete('/:id', httpCredito.deleteCredito);

// Mover documento a otra carpeta
router.put('/:documentId/move', httpCredito.moveDocument);

// Obtener URL de descarga de un archivo específico
router.get('/:id/file/:fileIndex/download', httpCredito.getFileDownloadURL);

export default router;
