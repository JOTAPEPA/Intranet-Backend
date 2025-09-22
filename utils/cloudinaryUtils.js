import cloudinary from '../config/cloudinary.js';

/**
 * Sube un archivo a Cloudinary
 * @param {Buffer} fileBuffer - Buffer del archivo
 * @param {string} folder - Carpeta en Cloudinary donde guardar el archivo
 * @param {string} resourceType - Tipo de recurso ('image', 'raw', 'video', 'auto')
 * @returns {Promise<Object>} - Resultado de la subida con URL y public_id
 */
export const uploadToCloudinary = async (fileBuffer, folder = 'compras', resourceType = 'auto') => {
    try {
        console.log('=== UPLOAD TO CLOUDINARY DEBUG ===');
        console.log('fileBuffer length:', fileBuffer ? fileBuffer.length : 'undefined');
        console.log('folder:', folder);
        console.log('resourceType:', resourceType);
        
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: resourceType,
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        console.log('Cloudinary upload success:', {
                            url: result.secure_url,
                            public_id: result.public_id,
                            format: result.format,
                            bytes: result.bytes,
                        });
                        resolve({
                            url: result.secure_url,
                            public_id: result.public_id,
                            format: result.format,
                            bytes: result.bytes,
                        });
                    }
                }
            );
            
            uploadStream.end(fileBuffer);
        });
    } catch (error) {
        console.error('Upload function error:', error);
        throw new Error(`Error al subir archivo a Cloudinary: ${error.message}`);
    }
};

/**
 * Elimina un archivo de Cloudinary
 * @param {string} publicId - ID público del archivo en Cloudinary
 * @param {string} resourceType - Tipo de recurso ('image', 'raw', 'video')
 * @returns {Promise<Object>} - Resultado de la eliminación
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        return result;
    } catch (error) {
        throw new Error(`Error al eliminar archivo de Cloudinary: ${error.message}`);
    }
};
