import { Router } from "express";
import httpControlInterno from "../controllers/controlInterno.js";
import httpFolder from "../controllers/folder.js";
import upload from "../Middlewares/uploadMiddleware.js";

const router = Router();

const handleMulterError = (err, req, res, next) => {
    console.error('=== MULTER ERROR CONTROL INTERNO ===');
    console.error('Error:', err.message);
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'El archivo es demasiado grande', error: err.message });
    if (err.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ message: 'Demasiados archivos', error: err.message });
    if (err.message === 'Tipo de archivo no permitido') return res.status(400).json({ message: 'Tipo de archivo no permitido', error: err.message });
    res.status(500).json({ message: 'Error procesando archivos', error: err.message, code: err.code });
};

// Endpoint de prueba simple
router.get('/test', (req, res) => {
    res.json({ message: 'Control Interno endpoint funciona!' });
});

// ========== RUTAS DE CARPETAS ==========
router.get('/folders', (req, res) => httpFolder.getFolderStructure(req, res, 'controlInterno'));
router.post('/folders', (req, res) => httpFolder.createFolder(req, res, 'controlInterno'));
router.delete('/folders/:folderPath', (req, res) => httpFolder.deleteFolder(req, res, 'controlInterno'));
router.get('/folders/:folderPath/items', (req, res) => httpFolder.getFolderItems(req, res, 'controlInterno', 'ControlInterno'));

// ========== RUTAS DE DOCUMENTOS ==========
router.post('/', [upload.array('documentos', 10), handleMulterError], httpControlInterno.postControlInterno);
router.get('/', httpControlInterno.getControlInterno);
router.get('/:id', httpControlInterno.getControlInternoById);
router.delete('/:id', httpControlInterno.deleteControlInterno);
router.put('/:documentId/move', httpControlInterno.moveDocument);
router.get('/:id/file/:fileIndex/download', httpControlInterno.getFileDownloadURL);

export default router;
