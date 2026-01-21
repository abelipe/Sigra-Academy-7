import { Router } from 'express';
import { SectionController } from './section.controller.mjs';
import { SectionModel } from './section.model.mjs';

const router = Router();
const sectionController = new SectionController({ ModelSection: SectionModel });

// Ruta para obtener todas las secciones académicas
router.get('/all', sectionController.getAllSections);
// Ruta para obtener secciones por grado
router.get('/grade/:gradeId', sectionController.getSectionsByGrade);
// Ruta para obtener una sección académica por su ID
router.get('/section/:sectionId', sectionController.getSectionById);
// Ruta para crear una nueva sección académica
router.post('/create', sectionController.createSection);
// Ruta para actualizar una sección académica por su ID
router.patch('/update/:sectionId', sectionController.updateSection);
// Ruta para eliminar una sección académica por su ID
router.delete('/delete/:sectionId', sectionController.deleteSection);

export const SectionRoutes = router;