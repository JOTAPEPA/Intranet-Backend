import multer from 'multer';

// Configuración de Multer para almacenamiento en memoria
const storage = multer.memoryStorage();

// Filtro para tipos de archivos permitidos
const fileFilter = (req, file, cb) => {
    console.log('📁 Archivo recibido:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
    });
    
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        'application/json',
        'application/zip',
        'application/x-zip-compressed'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        console.log('✅ Tipo de archivo permitido:', file.mimetype);
        cb(null, true);
    } else {
        console.log('❌ Tipo de archivo no permitido:', file.mimetype);
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
    }
};

// Configuración de Multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // Límite de 10MB por archivo
        files: 10 // Máximo 10 archivos por petición
    },
    fileFilter: fileFilter,
});

export default upload;
