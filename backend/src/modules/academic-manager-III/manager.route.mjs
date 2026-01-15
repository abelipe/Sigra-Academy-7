import express from 'express'
import multer from 'multer'
import * as courseController from './manager.controller.mjs'

const router = express.Router()

// Configurar multer para subir archivos de entrega
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, './uploads/submissions'),
	filename: (req, file, cb) => {
		const ts = Date.now();
		const safe = file.originalname.replace(/[^a-z0-9.\-\_]/gi, '_');
		cb(null, `${ts}_${safe}`);
	}
});
const upload = multer({ storage });

// ===== RUTAS DE CURSOS =====
router.get('/courses/:studentId', courseController.getCoursesByStudent)
router.get('/courses/:assignmentId/detail', courseController.getCourseDetail)
router.get('/courses/:assignmentId/activities', courseController.getActivitiesByAssignment)
router.get('/courses/:assignmentId/materials', courseController.getMaterialsByAssignment)
router.get('/courses/:assignmentId/grades', courseController.getGradesByAssignment)
router.post('/activities/:activityId/upload', upload.single('file'), courseController.uploadActivitySubmission)
router.post('/courses', courseController.createCourse)

// ===== RUTAS DE HORARIOS =====
router.get('/schedule/:studentId', courseController.getScheduleByStudent)

// ===== RUTAS DE RESUMEN ACADÉMICO =====
router.get('/student/:studentId/summary', courseController.getStudentAcademicSummary)

export const managerRoutes = router