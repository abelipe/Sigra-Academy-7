import { Router } from 'express';
import { SchedulesModel } from './schedules.model.mjs';
import { SchedulesController } from './schedules.controller.mjs';

const router = Router();
const controller = new SchedulesController({ ModelSchedules: SchedulesModel });

// Rutas relacionadas con los horarios académicos
// Obtener horarios de una sección
router.get('/section/:sectionId', controller.getScheduleBySectionId);
// Obtener un horario por su ID
router.get('/get/:scheduleId', controller.getScheduleById);
// Crear un nuevo horario
router.post('/create', controller.createSchedule);
// Actualizar un horario
router.patch('/update/:scheduleId', controller.updateSchedule);
// Eliminar un horario
router.delete('/delete/:scheduleId', controller.deleteSchedule);

export const SchedulesRoutes = router;
