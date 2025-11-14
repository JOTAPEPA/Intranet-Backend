import { storage } from '../config/firebase.js';
import { ref, uploadBytes, getDownloadURL, deleteObject, getMetadata } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

class FirebaseStorageService {
    
    /**
     * Sube un archivo a Firebase Storage
     * @param {Object} file - Archivo de multer (req.file)
     * @param {string} folder - Carpeta donde guardar el archivo (ej: 'compras', 'documentos')
     * @param {string} customName - Nombre personalizado (opcional)
     * @returns {Object} - Información del archivo subido
     */
    async uploadFile(file, folder = 'documentos', customName = null) {
        try {
            if (!file || !file.buffer) {
                throw new Error('Archivo no válido');
            }

            // Generar nombre basado en el nombre original con timestamp para evitar conflictos
            const timestamp = Date.now();
            const fileExtension = this.getFileExtension(file.originalname);
            const baseName = file.originalname.replace(fileExtension, ''); // Nombre sin extensión
            const fileName = customName || `${baseName}_${timestamp}${fileExtension}`;
            const filePath = `${folder}/${fileName}`;

            // Crear referencia al archivo en Firebase Storage
            const fileRef = ref(storage, filePath);

            // Configurar metadata del archivo
            const metadata = {
                contentType: file.mimetype,
                customMetadata: {
                    originalName: file.originalname,
                    uploadDate: new Date().toISOString(),
                    size: file.size.toString()
                }
            };

            console.log(`📤 Subiendo archivo: ${fileName} a ${folder}`);
            
            // Subir el archivo
            const snapshot = await uploadBytes(fileRef, file.buffer, metadata);
            
            // Obtener URL de descarga
            const downloadURL = await getDownloadURL(snapshot.ref);

            console.log(`✅ Archivo subido exitosamente: ${fileName}`);

            return {
                success: true,
                fileName: fileName,
                originalName: file.originalname,
                filePath: filePath,
                downloadURL: downloadURL,
                size: file.size,
                mimetype: file.mimetype,
                uploadDate: new Date(),
                firebaseRef: snapshot.ref.fullPath
            };

        } catch (error) {
            console.error('❌ Error subiendo archivo a Firebase:', error);
            throw new Error(`Error subiendo archivo: ${error.message}`);
        }
    }

    /**
     * Sube múltiples archivos a Firebase Storage
     * @param {Array} files - Array de archivos de multer (req.files)
     * @param {string} folder - Carpeta donde guardar los archivos
     * @returns {Array} - Array con información de los archivos subidos
     */
    async uploadMultipleFiles(files, folder = 'documentos') {
        try {
            if (!files || !Array.isArray(files) || files.length === 0) {
                return [];
            }

            console.log(`📤 Subiendo ${files.length} archivo(s) a ${folder}`);
            
            const uploadPromises = files.map(file => this.uploadFile(file, folder));
            const results = await Promise.all(uploadPromises);

            const successfulUploads = results.filter(result => result.success);
            console.log(`✅ ${successfulUploads.length}/${files.length} archivos subidos exitosamente`);

            return successfulUploads;

        } catch (error) {
            console.error('❌ Error subiendo múltiples archivos:', error);
            throw new Error(`Error subiendo archivos: ${error.message}`);
        }
    }

    /**
     * Descarga un archivo de Firebase Storage
     * @param {string} filePath - Ruta del archivo en Firebase Storage
     * @returns {string} - URL de descarga
     */
    async getFileDownloadURL(filePath) {
        try {
            const fileRef = ref(storage, filePath);
            const downloadURL = await getDownloadURL(fileRef);
            return downloadURL;
        } catch (error) {
            console.error('❌ Error obteniendo URL de descarga:', error);
            throw new Error(`Error obteniendo URL de descarga: ${error.message}`);
        }
    }

    /**
     * Elimina un archivo de Firebase Storage
     * @param {string} filePath - Ruta del archivo en Firebase Storage
     * @returns {boolean} - true si se eliminó exitosamente
     */
    async deleteFile(filePath) {
        try {
            const fileRef = ref(storage, filePath);
            await deleteObject(fileRef);
            console.log(`🗑️ Archivo eliminado: ${filePath}`);
            return true;
        } catch (error) {
            console.error('❌ Error eliminando archivo:', error);
            throw new Error(`Error eliminando archivo: ${error.message}`);
        }
    }

    /**
     * Obtiene metadatos de un archivo
     * @param {string} filePath - Ruta del archivo en Firebase Storage
     * @returns {Object} - Metadatos del archivo
     */
    async getFileMetadata(filePath) {
        try {
            const fileRef = ref(storage, filePath);
            const metadata = await getMetadata(fileRef);
            return metadata;
        } catch (error) {
            console.error('❌ Error obteniendo metadatos:', error);
            throw new Error(`Error obteniendo metadatos: ${error.message}`);
        }
    }

    /**
     * Elimina múltiples archivos
     * @param {Array} filePaths - Array de rutas de archivos
     * @returns {Array} - Resultados de las eliminaciones
     */
    async deleteMultipleFiles(filePaths) {
        try {
            if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
                return [];
            }

            const deletePromises = filePaths.map(async (filePath) => {
                try {
                    await this.deleteFile(filePath);
                    return { filePath, success: true };
                } catch (error) {
                    return { filePath, success: false, error: error.message };
                }
            });

            const results = await Promise.all(deletePromises);
            return results;
        } catch (error) {
            console.error('❌ Error eliminando múltiples archivos:', error);
            throw new Error(`Error eliminando archivos: ${error.message}`);
        }
    }

    /**
     * Sube un archivo a Firebase Storage usando el nombre original exacto
     * @param {Object} file - Archivo de multer (req.file)
     * @param {string} folder - Carpeta donde guardar el archivo
     * @returns {Object} - Información del archivo subido
     */
    async uploadFileWithOriginalName(file, folder = 'documentos') {
        try {
            if (!file || !file.buffer) {
                throw new Error('Archivo no válido');
            }

            // Usar el nombre original exacto
            const fileName = file.originalname;
            const filePath = `${folder}/${fileName}`;

            // Crear referencia al archivo en Firebase Storage
            const fileRef = ref(storage, filePath);

            // Configurar metadata del archivo
            const metadata = {
                contentType: file.mimetype,
                customMetadata: {
                    originalName: file.originalname,
                    uploadDate: new Date().toISOString(),
                    size: file.size.toString()
                }
            };

            console.log(`📤 Subiendo archivo con nombre original: ${fileName} a ${folder}`);
            
            // Subir el archivo
            const snapshot = await uploadBytes(fileRef, file.buffer, metadata);
            
            // Obtener URL de descarga
            const downloadURL = await getDownloadURL(snapshot.ref);

            console.log(`✅ Archivo subido exitosamente: ${fileName}`);

            return {
                success: true,
                fileName: fileName,
                originalName: file.originalname,
                filePath: filePath,
                downloadURL: downloadURL,
                size: file.size,
                mimetype: file.mimetype,
                uploadDate: new Date(),
                firebaseRef: snapshot.ref.fullPath
            };

        } catch (error) {
            console.error('❌ Error subiendo archivo a Firebase:', error);
            throw new Error(`Error subiendo archivo: ${error.message}`);
        }
    }

    /**
     * Sube múltiples archivos usando nombres originales
     * @param {Array} files - Array de archivos de multer (req.files)
     * @param {string} folder - Carpeta donde guardar los archivos
     * @returns {Array} - Array con información de los archivos subidos
     */
    async uploadMultipleFilesWithOriginalNames(files, folder = 'documentos') {
        try {
            if (!files || !Array.isArray(files) || files.length === 0) {
                return [];
            }

            console.log(`📤 Subiendo ${files.length} archivo(s) con nombres originales a ${folder}`);
            
            const uploadPromises = files.map(file => this.uploadFileWithOriginalName(file, folder));
            const results = await Promise.all(uploadPromises);

            const successfulUploads = results.filter(result => result.success);
            console.log(`✅ ${successfulUploads.length}/${files.length} archivos subidos exitosamente`);

            return successfulUploads;

        } catch (error) {
            console.error('❌ Error subiendo múltiples archivos:', error);
            throw new Error(`Error subiendo archivos: ${error.message}`);
        }
    }

    /**
     * Obtiene la extensión de un archivo
     * @param {string} filename - Nombre del archivo
     * @returns {string} - Extensión del archivo
     */
    getFileExtension(filename) {
        return filename.substring(filename.lastIndexOf('.'));
    }

    /**
     * Valida el tipo de archivo
     * @param {string} mimetype - Tipo MIME del archivo
     * @returns {boolean} - true si el tipo es válido
     */
    isValidFileType(mimetype) {
        const allowedTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv'
        ];

        return allowedTypes.includes(mimetype);
    }

    /**
     * Convierte bytes a formato legible
     * @param {number} bytes - Tamaño en bytes
     * @returns {string} - Tamaño formateado
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

const firebaseStorageService = new FirebaseStorageService();

// Named exports para compatibilidad
export const uploadFile = (file, folder, customName) => firebaseStorageService.uploadFile(file, folder, customName);
export const uploadMultipleFiles = (files, folder) => firebaseStorageService.uploadMultipleFiles(files, folder);
export const uploadFileWithOriginalName = (file, folder) => firebaseStorageService.uploadFileWithOriginalName(file, folder);
export const uploadMultipleFilesWithOriginalNames = (files, folder) => firebaseStorageService.uploadMultipleFilesWithOriginalNames(files, folder);
export const deleteFile = (filePath) => firebaseStorageService.deleteFile(filePath);
export const deleteMultipleFiles = (filePaths) => firebaseStorageService.deleteMultipleFiles(filePaths);
export const getFileDownloadURL = (filePath) => firebaseStorageService.getFileDownloadURL(filePath);
export const getFileMetadata = (filePath) => firebaseStorageService.getFileMetadata(filePath);

// Default export para compatibilidad
export default firebaseStorageService;