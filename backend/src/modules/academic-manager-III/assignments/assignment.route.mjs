import {Router} from 'express'
import { AssignemtController } from './assignment.controller.mjs';
import { TeacherAssignmentModel } from './assignment.model.mjs';

const router = Router();
const controller = new AssignemtController({assignmentModel: TeacherAssignmentModel});

// Rutas relacionadas con asignaciones de cursos a profesores

// Ruta para obtener cursos asignados a un estudiante
router.get('/student/:studentId/courses', controller.getCoursesByStudentId);
// Ruta para obtener cursos asignados a una sección
router.get('/section/:sectionId/courses', controller.getCoursesBySectionId);
// Ruta para obtener detalles de un curso asignado
router.get('/course/:assignmentId', controller.getCourseById);
// Ruta para obtener todas las actividades de un curso asignado
router.get('/assignment/:assignmentId/activities', controller.getActivitiesByAssignmentID);
// Ruta para obtener todas las personas relacionadas a un curso asignado
router.get('/assignment/:assignmentId/people', controller.getPeopleByAssignmentID);
// Ruta para crear una nueva asignación de curso a profesor
router.post('/create', controller.createAssignment);
// Ruta para actualizar una asignación de curso a profesor
router.patch('/update/:assignmentId', controller.updateAssignment);
// Ruta para eliminar una asignación de curso a profesor
router.delete('/delete/:assignmentId', controller.deleteAssignment);

export const AssignmentRouter = router;