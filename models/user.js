import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    nombres: { type: String, required: true },
    apellidos: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    estado: {type: Boolean, default: true},
    role: { type: String, enum: ["sistemas", "administrador", "talentoHumano", "gerencia", "contabilidad", "tesoreria", "credito", "controlInterno", "riesgos", "compras"], default: "sistemas" }
}, {
    timestamps: true
})

export default mongoose.model("User", userSchema);