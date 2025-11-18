// Script template para actualizar controladores con sistema de carpetas
// Este archivo documenta el patrón usado para actualizar cada controlador

const DEPARTMENT_CONFIG = {
    tesoreria: {
        model: 'Tesoreria',
        singular: 'tesoreria',
        path: 'tesoreria',
        capitalize: 'Tesoreria'
    },
    riesgos: {
        model: 'Riesgos',
        singular: 'riesgo',
        path: 'riesgos',
        capitalize: 'Riesgos'
    },
    sistemas: {
        model: 'Sistema',
        singular: 'sistema',
        path: 'sistemas',
        capitalize: 'Sistema'
    },
    talentoHumano: {
        model: 'TalentoHumano',
        singular: 'talentoHumano',
        path: 'talentoHumano',
        capitalize: 'TalentoHumano'
    },
    controlInterno: {
        model: 'ControlInterno',
        singular: 'controlInterno',
        path: 'controlInterno',
        capitalize: 'ControlInterno'
    },
    gerencia: {
        model: 'Gerencia',
        singular: 'gerencia',
        path: 'gerencia',
        capitalize: 'Gerencia'
    }
};

// CAMBIOS A APLICAR EN CADA CONTROLADOR:

// 1. IMPORTACIONES
// Agregar: import Folder from '../models/folder.js';

// 2. POST METHOD
// - Cambiar: const { documento } = req.body;
// - Por: const { documento, descripcion = '', folderPath = '/' } = req.body;
// - Agregar verificación de carpeta
// - Agregar descripcion y folderPath al Data object
// - Actualizar carpeta después de guardar

// 3. GET METHOD
// - Agregar filtros por folderId y search
// - Agregar propiedades calculadas (tieneArchivos, cantidadArchivos)
// - Cambiar respuesta a formato { success: true, data: ... }

// 4. DELETE METHOD
// - Remover documento del array de la carpeta
// - Cambiar respuesta a formato { success: true, message: ... }

// 5. AGREGAR MÉTODO moveDocument
// - Nuevo método para mover documentos entre carpetas

export default DEPARTMENT_CONFIG;
