import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const generarJWT = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = { userId };
        console.log("Generando JWT para el usuario:", userId);
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '4h' },
            (err, token) => {
                if (err) {
                    console.log(err);
                    reject("No se pudo generar el token");
                } else {
                    resolve(token)
                }
            }
        )

    })
};


const ValidarJWT = async (req, res, next) => {
    const authHeader = req.header("Authorization");
    const token = authHeader?.startsWith( "Bearer" ) ? authHeader.split("")[1] : null;

    if (!token) {
        return res.status(401).json({ msg: "No hay token en la petición" });
    }

    try{
        const { userId } = jwt.verify( token, process.env.JWT_SECRET) 
        const usuario = await User.findById(userId).select("estado")

        if  (!usuario) {
            return res.status(401).json({ msg: "Token no válido - usuario no existe en DB" });
        }

        if (!usuario.estado) {
            return res.status(401).json({ msg: "Token no válido - usuario con estado: false" });
        }

        req.usuario = usuario;
        next();

    } catch (error) {
        console.log(error);
        return res.status(401).json({ msg: "Token no válido" });
    }
}

export default { generarJWT, ValidarJWT };