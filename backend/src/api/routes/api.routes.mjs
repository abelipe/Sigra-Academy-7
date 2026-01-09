import { Router } from "express";
import { subjectRoute } from "../../modules/academic-structure-II/subjects/subjects.route.mjs";
import prelaciesRoute from "../../modules/academic-structure-II/prelacies/prelacies.route.mjs";
import academicStructureRoutes from "../../modules/academic-structure-II/structure.route.mjs";
import { GradesLogRoutes } from '../../modules/grades-record-V/grades/grades.route.mjs';
import { RecordsRoutes } from '../../modules/grades-record-V/records/records.route.mjs';
import { SETTINGS } from '../../../config/settings.config.mjs';

const router = Router();

// Definir todas las rutas de los módulos aquí
// Ruta para materias: /api/subject/subjects
// Ruta para prelaciones: /api/subject/prelaciones
// Ruta para estructura académica: /api/subject/academic-structure

// Montar las rutas de materias
router.use("/subjects", subjectRoute);

// Montar rutas de prelaciones si aplica
router.use("/prelacies", prelaciesRoute);

// Montar las rutas de la estructura académica
router.use("/academic-structure", academicStructureRoutes);

// Crear routers para el módulo de grades-record-V
const gradesRoutes = {
    grades: Router().use(`${SETTINGS.BASE_PATH}/grades-log`, GradesLogRoutes),
    records: Router().use(`${SETTINGS.BASE_PATH}/records`, RecordsRoutes),
};

export const ListRoutes = {
    subject: router,
    grades: gradesRoutes,
};
