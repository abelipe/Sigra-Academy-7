import { Router } from 'express';
import { AcademicRecordsController } from './records.controller.mjs';
import { AcademicRecordsModel } from './records.model.mjs';

const router = Router();

// Inyectamos el modelo al controlador
const recordsController = new AcademicRecordsController({ ModelRecords: AcademicRecordsModel });

// Definimos las rutas
// GET: Ver boletín de un estudiante
router.get('/boletin/:studentId', recordsController.getStudentReportCard);
// GET: Ver todos los boletines por año académico
router.get('/boletines/academic-year/:yearId', recordsController.getAllReportCardsByAcademicYear);
// POST: Crear nuevo registro (Cerrar nota de materia)
router.post('/create', recordsController.createAcademicRecord);
// PATCH: Corregir nota existente
router.patch('/update/:recordId', recordsController.updateAcademicRecord);
// DELETE: Eliminar registro académico
router.delete('/delete/:recordId', recordsController.deleteAcademicRecord);
// Exportamos con el nombre que espera tu archivo api.routes.mjs
export const RecordsRoutes = router;