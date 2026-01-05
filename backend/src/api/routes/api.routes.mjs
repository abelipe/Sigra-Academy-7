import { Router } from 'express';
import { subjectRoute } from '../../modules/academic-structure-II/subjects/subjects.route.mjs';

const router = Router();

// Definir todas las rutas de los módulos aquí
// Ruta para materias: /api/subject/subjects

// Montar las rutas de materias
router.use("/subjects", subjectRoute);

// (module removed)

export const ListRoutes = {
    subject: router
};