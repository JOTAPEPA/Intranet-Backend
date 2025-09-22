console.log('Test servidor funcionando...');

import express from 'express';
const app = express();

app.get('/test', (req, res) => {
    res.json({ message: 'Servidor de prueba funcionando' });
});

app.listen(3000, () => {
    console.log('Servidor de prueba en puerto 3000');
});
