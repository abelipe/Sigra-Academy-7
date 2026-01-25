import * as courseModel from './manager.model.mjs'
import { GradesLogModel } from '../grades-record-V/grades/grades.model.mjs'
import { ResourceModel } from '../teaching-manager-IV/courseResources/resources.model.mjs';
import { db } from '../../../database/db.database.mjs'
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

/* Controlador para obtener calificaciones de una asignación (mock si no hay datos) */
export const getGradesByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (courseModel.getGradesByAssignmentId) {
      const grades = await courseModel.getGradesByAssignmentId(assignmentId);
      return res.json({ success: true, data: grades });
    }

    const mock = [
      { name: 'Tarea 1', score: 8, max: 10, feedback: 'Bien hecho' },
      { name: 'Parcial', score: 25, max: 30, feedback: 'Revisar ejercicios 3 y 4' }
    ];

    res.json({ success: true, data: mock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Controlador para recibir subida de archivo de una actividad */
export const uploadActivitySubmission = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { studentId } = req.body;

    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    // Inserción real en la tabla submissions
    const [result] = await db.query(
      `INSERT INTO submissions (activity_id, student_user_id, file_path, comments) 
       VALUES (?, ?, ?, ?)`,
      [activityId, studentId || 3, req.file.path, 'Entrega realizada por el estudiante']
    );

    const fileInfo = {
      submissionId: result.insertId,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      activityId
    };

    res.status(201).json({ success: true, data: fileInfo });
  } catch (error) {
    console.error("Error en uploadActivitySubmission:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Controlador para obtener materiales de una asignación (fallback mock) */
export const getMaterialsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    // Llamamos al modelo que ya tienes creado en el módulo de recursos
    const result = await ResourceModel.getResourcesByAssignment(assignmentId);
    
    // Si el modelo devuelve un error o no hay recursos
    if (result.error) {
        return res.status(404).json({ success: false, message: result.error });
    }

    // Si todo va bien, devolvemos los datos de la DB
    res.json({ 
      success: true, 
      data: result.resources || [] 
    });

  } catch (error) {
    console.error("Error en getMaterialsByAssignment:", error);
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

/* Controlador para obtener resumen académico del estudiante */
export const getStudentAcademicSummary = async (req, res) => {
  try {
    const { studentId } = req.params
    
    // 1. Obtenemos los cursos en los que está inscrito
    const courses = await courseModel.getCoursesByStudentId(studentId)
    
    // 2. Obtenemos todas sus notas del log
    const gradesResult = await GradesLogModel.getGradesLogByUserId(studentId)
    const grades = gradesResult.grades || []

    // 3. Cruzamos la información de forma precisa
    const summary = courses.map(course => {
      const courseGrades = grades.filter(grade => 
        grade.section_name === course.section_name && 
        grade.subject_name === course.subject_name
      )

      return {
        ...course,
        grades: courseGrades
      }
    })

    res.json({ 
      success: true, 
      student_id: studentId,
      academic_load: summary 
    })

  } catch (error) {
    console.error("Error en getStudentAcademicSummary:", error)
    res.status(500).json({ success: false, message: error.message })
  }
}