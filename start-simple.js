console.log('=== INICIANDO PROCESO ===');

try {
    console.log('Importando módulos...');
    
    // Importaciones básicas primero
    const { default: mongoose } = await import('mongoose');
    const { default: dotenv } = await import('dotenv');
    const { default: express } = await import('express');
    const { default: cors } = await import('cors');
    
    console.log('✅ Módulos básicos importados');
    
    // Configurar dotenv
    dotenv.config();
    console.log('✅ Variables de entorno cargadas');
    console.log('Puerto:', process.env.PORT);
    console.log('MongoDB:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
    
    // Crear app de Express
    const app = express();
    
    // Middlewares básicos
    app.use(cors({ 
        origin: ['http://localhost:5174', 'null'],
        credentials: true
    }));
    app.use(express.json());
    
    console.log('✅ Middlewares configurados');
    
    // Endpoint de prueba básico
    app.get('/test', (req, res) => {
        res.json({ message: 'Servidor funcionando correctamente', timestamp: new Date() });
    });
    
    console.log('✅ Rutas básicas configuradas');
    
    // Conectar a MongoDB
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Iniciar servidor
    const server = app.listen(process.env.PORT, () => {
        console.log(`🚀 Servidor iniciado en puerto ${process.env.PORT}`);
        console.log('🌐 Endpoints disponibles:');
        console.log(`   - http://localhost:${process.env.PORT}/test`);
    });
    
    server.on('error', (error) => {
        console.error('❌ Error del servidor:', error);
    });
    
} catch (error) {
    console.error('❌ Error crítico:', error);
    process.exit(1);
}
