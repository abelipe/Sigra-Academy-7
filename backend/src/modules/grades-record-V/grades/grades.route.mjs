import {Router} from 'express';
import {GradesLogController} from './grades.controller.mjs';
import {GradesLogModel} from './grades.model.mjs';

// Configuración de las rutas para los registros de calificaciones
const router = Router();
const gradesController = new GradesLogController({ModelGradesLog: GradesLogModel});

// Ruta para obtener los registros de calificaciones por ID de actividad
router.get('/activity/:activityId', gradesController.getGradesLogByActivityId);
// Ruta para obtener todas las calificaciones
router.get('/all', gradesController.getAllGradesLog);
// Ruta para obtener los registros de calificaciones por el ID del usuario
router.get('/user/:userId', gradesController.getGradesLogByUserId);
// Ruta para obtener las calificaciones de una actividad de una materia especifica
router.get('/activity/:activityId/subject/:subjectId', gradesController.getGradesLogByActivityAndSubject);
// Ruta para crear un nuevo registro de calificación
router.post('/create', gradesController.addGradeLogEntry);
// Ruta para actualizar un registro de calificación existente
router.patch('/update/:gradeLogId', gradesController.updateGradeLogEntry);
// Ruta para eliminar un registro de calificación
router.delete('/delete/:gradeLogId', gradesController.deleteGradeLogEntry);

export const GradesLogRoutes = router;