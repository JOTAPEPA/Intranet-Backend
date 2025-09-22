import multer from 'multer';

// Configuración de Multer para almacenamiento en memoria
const storage = multer.memoryStorage();

// Filtro para tipos de archivos permitidos
const fileFilter = (req, file, cb) => {
    console.log('=== MULTER FILE FILTER DEBUG ===');
    console.log('File received:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
    });
    
    // TEMPORALMENTE PERMITIR TODOS LOS TIPOS PARA DEBUG
    console.log('PERMITIENDO TODOS LOS ARCHIVOS PARA DEBUG');
    cb(null, true);
    
    // Código original comentado para debug
    /*
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        'application/json',
        'application/zip',
        'application/x-zip-compressed',
        'image/webp',
        'image/svg+xml'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        console.log('File type allowed:', file.mimetype);
        cb(null, true);
    } else {
        console.log('File type rejected:', file.mimetype);
        cb(new Error('Tipo de archivo no permitido'), false);
    }
    */
};

// Configuración de Multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // Límite de 10MB
    },
    fileFilter: fileFilter,
});

export default upload;
