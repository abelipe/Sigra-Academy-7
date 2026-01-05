import { Router } from "express";
import { subjectRoute } from "../../modules/academic-structure-II/subjects/subjects.route.mjs";
import prelaciesRoute from "../../modules/academic-structure-II/prelacies/prelacies.route.mjs";
import academicStructureRoutes from "../../modules/academic-structure-II/structure.route.mjs";

const router = Router();

// Definir todas las rutas de los módulos aquí
// Ruta para materias: /api/subject/subjects
// Ruta para prelaciones: /api/subject/prelaciones
// Ruta para estructura académica: /api/subject/academic-structure

// Montar las rutas de materias
router.use("/subjects", subjectRoute);

// (module removed)

// Montar las rutas de la estructura académica
router.use("/academic-structure", academicStructureRoutes);

export const ListRoutes = {
	subject: router,
};
