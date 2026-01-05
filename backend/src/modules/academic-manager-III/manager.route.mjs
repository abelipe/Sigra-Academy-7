import express from 'express'
import * as courseController from './manager.controller.mjs'

const router = express.Router()

// ===== RUTAS DE CURSOS =====
router.get('/courses/:studentId', courseController.getCoursesByStudent)
router.get('/courses/:assignmentId/detail', courseController.getCourseDetail)
router.post('/courses', courseController.createCourse)

// ===== RUTAS DE HORARIOS =====
router.get('/schedule/:studentId', courseController.getScheduleByStudent)

export default router