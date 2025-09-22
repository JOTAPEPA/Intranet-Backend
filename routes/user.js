import { Router } from "express";
import httpUser from "../controllers/user.js";

const router = Router();

router.post('/', [
], httpUser.postUser);

router.post('/login', [
], httpUser.postLogin);

router.get('/', [ 
], httpUser.getListarTodos)

router.get('/:id', [
], httpUser.getListarById )

export default router;  