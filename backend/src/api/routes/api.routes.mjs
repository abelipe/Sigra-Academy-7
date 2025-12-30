import {Router} from 'express';
import { subjectRoute } from '../../modules/academic-structure-II/subjects/subjects.route.mjs';

const router = Router();

// Definir todas las rutas de los modulos aquí
export const ListRoutes = {
    subject: router.use("/subjects",subjectRoute)
    
}