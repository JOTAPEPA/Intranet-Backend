import { Router } from "express";
import httpTalentoHumano from "../controllers/talentoHumano.js";
import upload from "../Middlewares/uploadMiddleware.js";

const router = Router();

const handleMulterError = (err, req, res, next) => {
    console.error('=== MULTER ERROR TALENTO HUMANO ===');
    console.error('Error:', err.message);
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'El archivo es demasiado grande', error: err.message });
    if (err.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ message: 'Demasiados archivos', error: err.message });
    if (err.message === 'Tipo de archivo no permitido') return res.status(400).json({ message: 'Tipo de archivo no permitido', error: err.message });
    res.status(500).json({ message: 'Error procesando archivos', error: err.message, code: err.code });
};

router.post('/', [upload.array('documentos', 10), handleMulterError], httpTalentoHumano.postTalentoHumano);
router.get('/', httpTalentoHumano.getTalentoHumano);
router.get('/:id', httpTalentoHumano.getTalentoHumanoById);
router.get('/:id/file/:fileIndex/download', httpTalentoHumano.getFileDownloadURL);
router.delete('/:id', httpTalentoHumano.deleteTalentoHumano);

export default router;
