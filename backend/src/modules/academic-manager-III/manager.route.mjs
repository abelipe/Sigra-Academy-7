import express from 'express'
import * as courseController from './manager.controller.mjs'

const router = express.Router()

// ===== RUTAS DE CURSOS =====
router.get('/courses/:studentId', courseController.getCoursesByStudent)
// Ruta para obtener el horario de un estudiante
router.get('/schedule/:studentId', courseController.getScheduleByStudent)
router.get('/courses/:assignmentId/detail', courseController.getCourseDetail)
router.get('/courses/:assignmentId/activities', courseController.getActivitiesByAssignment)
router.post('/courses', courseController.createCourse)

// ===== RUTAS DE HORARIOS =====
router.get('/schedule/:studentId', courseController.getScheduleByStudent)

export const managerRoutes = router