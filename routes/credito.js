import { Router } from "express";
import httpCredito from "../controllers/credito.js";
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

router.post('/', [upload.array('documentos', 10), handleMulterError], httpCredito.postCredito);
router.get('/', httpCredito.getCredito);
router.get('/:id', httpCredito.getCreditoById);
router.delete('/:id', httpCredito.deleteCredito);

// Nueva ruta para obtener URL de descarga de un archivo específico
router.get('/:id/file/:fileIndex/download', httpCredito.getFileDownloadURL);

export default router;
