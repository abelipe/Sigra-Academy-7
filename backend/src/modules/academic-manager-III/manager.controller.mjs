import * as courseModel from './manager.model.mjs'

/* Controlador para obtener cursos de un estudiante */
export const getCoursesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params
    const courses = await courseModel.getCoursesByStudentId(studentId)
    res.json({ success: true, data: courses })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/* Controlador para obtener detalle de un curso */
export const getCourseDetail = async (req, res) => {
  try {
    const { assignmentId } = req.params
    const course = await courseModel.getCourseById(assignmentId)
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
    res.json({ success: true, data: course })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/* Controlador para obtener horario de un estudiante */
export const getScheduleByStudent = async (req, res) => {
  try {
    const { studentId } = req.params
    const schedule = await courseModel.getScheduleByStudentId(studentId)
    res.json({ success: true, data: schedule })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/* Controlador para obtener actividades de una asignación */
export const getActivitiesByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const activities = await courseModel.getActivitiesByAssignmentId(assignmentId);
    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Controlador para crear un nuevo curso */
export const createCourse = async (req, res) => {
  try {
    const result = await courseModel.createCourse(req.body)
    res.status(201).json({ success: true, data: { insertId: result.insertId } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}