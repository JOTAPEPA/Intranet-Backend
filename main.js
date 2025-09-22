import mongoose from 'mongoose'
import dotenv from 'dotenv'
import express from 'express';
import cors from 'cors';


dotenv.config()


import httpUser from './routes/user.js';
import httpCompra from './routes/compras.js';
import httpContabilidad from './routes/contabilidad.js';
import httpControlInterno from './routes/controlInterno.js';
import httpCredito from './routes/credito.js';
import httpGerencia from './routes/gerencia.js';
import httpRiesgos from './routes/riesgos.js';
import httpTalentoHumano from './routes/talentoHumano.js';
import httpTesoreria from './routes/tesoreria.js';

const app = express()

app.use(cors({ 
    origin: ['http://localhost:5173', 'http://localhost:5174', 'null'], // Permitir frontend en ambos puertos y archivos locales
    credentials: true
}));

app.use(express.json());

// Log de todas las peticiones
app.use((req, res, next) => {
    console.log('🔥🔥🔥 === PETICIÓN RECIBIDA ===');
    console.log(`⏰ ${new Date().toISOString()}`);
    console.log(`📡 ${req.method} ${req.url}`);
    console.log('📋 Content-Type:', req.get('Content-Type'));
    console.log('🔥🔥🔥 ===================');
    next();
});

app.use('/api/user', httpUser);
app.use('/api/compras', httpCompra);
app.use('/api/contabilidad', httpContabilidad);
app.use('/api/control-interno', httpControlInterno);
app.use('/api/credito', httpCredito);
app.use('/api/gerencia', httpGerencia);
app.use('/api/riesgos', httpRiesgos);
app.use('/api/talento-humano', httpTalentoHumano);
app.use('/api/tesoreria', httpTesoreria);

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
    console.error('=== GLOBAL ERROR HANDLER ===');
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('Req URL:', req.url);
    console.error('Req Method:', req.method);
    
    res.status(500).json({
        message: 'Error interno del servidor',
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const startServer = async () => {
    try {
        console.log('🚀 === INICIANDO SERVIDOR ===');
        console.log('Puerto:', process.env.PORT);
        console.log('MongoDB URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
        
        // Conectar a MongoDB primero
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB');
        
        // Luego iniciar el servidor
        const server = app.listen(process.env.PORT, () => {
            console.log(`✅ Servidor escuchando en el puerto ${process.env.PORT}`);
            console.log('🎯 Endpoints disponibles:');
            console.log('   - POST /api/compras');
            console.log('   - GET  /api/control-interno/test');
            console.log('   - Y todos los demás módulos...');
        });
        
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Puerto ${process.env.PORT} ya está en uso`);
                console.error('💡 Soluciones:');
                console.error('   1. Cerrar otros servidores que usen el puerto 5000');
                console.error('   2. Ejecutar: Get-Process -Name "node" | Stop-Process -Force');
                console.error('   3. Reiniciar y ejecutar solo una instancia del servidor');
                process.exit(1);
            } else {
                console.error('❌ Error del servidor:', error);
            }
        });
        
    } catch (error) {
        console.error('❌ Error al iniciar:', error);
        process.exit(1);
    }
};

startServer();
