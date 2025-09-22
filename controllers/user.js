import User from "../models/user.js";
import bcrypt from "bcrypt";
import validarJWT from "../Middlewares/validarJWT.js";

const httpUser = {

    postUser: async (req, res) => {
        try {
            const {
                username,
                nombres,
                apellidos,
                email,
                password,
                estado,
                role

            } = req.body;

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const newUser = new User({
                username,
                nombres,
                apellidos,
                email,
                password: hashedPassword,
                estado,
                role
            })

            const savedUser = await newUser.save()
            res.status(201).json({ message: "User created successfully", savedUser });

        } catch (error) {
            console.error("Error creating user:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    postLogin: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: "Email y contraseña son requeridos" })
            }

            const usuario = await User.findOne({ email })
            if (!usuario) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            const isMatch = await bcrypt.compare(password, usuario.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Contraseña incorrecta" });
            }

            const token = await validarJWT.generarJWT(usuario._id);

            res.json({
                token,
                user: usuario
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error al iniciar sesión" });

        }
    },

    getListarTodos: async (req, res) => {
        try {
            const usuarios = await User.find();
            res.json(usuarios);
        } catch (error) {
            console.log("Error al listar usuarios", error);
            res.status(500).json({ error: "Error al listar usuarios" });
        }
    },

    getListarById: async (req, res) => {
        try {
            const { id } = req.params;
            const usuario = await User.findById(id);

            if (!usuario) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            res.json(usuario);
        } catch ( error ) {
            console.log("Error al listar usuario", error);      
            res.status(500).json({ error: "Error al listar usuario" });
        }
    },

}

export default httpUser;