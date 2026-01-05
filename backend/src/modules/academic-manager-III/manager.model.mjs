// Importar conexión a la base de datos
import { db } from '../../../database/db.database.mjs'
// import { connection } from '../../../database/connection.mjs'

// Obtener cursos de un estudiante
export const getCoursesByStudentId = async (studentId) => {
    try {
        const [rows] = await db.query(
        `SELECT ta.assignment_id, s.subject_name, sec.section_name, g.grade_name, ay.name AS academic year
            FROM enrollments e
            JOIN sections sec ON e.section_id = sec.section_id
            JOIN grades g ON sec.grade_id = g.grade_id
            JOIN academic years ay ON sec.academic_year_id = ay.year_id JOIN teacher_assignments ta ON ta.section_id = sec.section_id JOIN subjects s ON ta.subject_id = s.subject_id
            WHERE e.student_user_id = ?`,
        [studentId])

        return rows

        /* OBSOLET CODE -- AC 02/01/2026
        const [courses] = await connection.query(
          `SELECT c.* FROM courses c
           INNER JOIN enrollments e ON c.id = e.course_id
           WHERE e.student_id = ?`,
          [studentId]
        )
        return courses
        */

    } catch (error) {
        throw new Error(`Error fetching courses: ${error.message}`)
    }
}

// Obtener detalle de un curso
export const getCourseById = async (assignmentId) => {
    try {
        const [rows] = await db.query(
        `SELECT ta.assignment_id, s.subject_name, sec.section_name, g.grade_name, ay.name AS academic year, CONCAT(u.first_name, ' ', u.last_name) AS teacher_name
            FROM teacher_assignments ta
            JOIN subjects s ON ta.subject_id = s.subject_id
            JOIN sections sec ON ta.section_id = sec.section_id
            JOIN grades g ON sec.grade_id = g.grade_id
            JOIN academic_years ay ON sec.academic_year_id = ay.year_id
            JOIN users u ON ta.teacher_user_id = u.user_id WHERE ta.assignment_id = ?`,
        [assignmentId])

        return rows[0]

        /* OBSOLET CODE -- AC 02/01/2026
        const [course] = await connection.query(
          'SELECT * FROM courses WHERE id = ?',
          [courseId]
        )
        return course[0]
        */

    } catch (error) {
        throw new Error(`Error fetching course: ${error.message}`)
    }
}

// Obtener horario de un estudiante
export const getScheduleByStudentId = async (studentId) => {
  try {
    const [rows] = await db.query(
      `SELECT sch.schedule_id,
              sch.day_of_week,
              sch.start_time,
              sch.end_time,
              sch.classroom,
              ta.assignment_id,
              s.subject_name,
              sec.section_name,
              g.grade_name,
              ay.name AS academic_year,
              CONCAT(u.first_name, ' ', u.last_name) AS teacher_name
        FROM enrollments e
        JOIN sections sec ON e.section_id = sec.section_id
        JOIN grades g ON sec.grade_id = g.grade_id
        JOIN academic_years ay ON sec.academic_year_id = ay.year_id
        JOIN teacher_assignments ta ON ta.section_id = sec.section_id
        JOIN subjects s ON ta.subject_id = s.subject_id
        JOIN schedules sch ON sch.assignment_id = ta.assignment_id
        JOIN users u ON ta.teacher_user_id = u.user_id
        WHERE e.student_user_id = ?
        ORDER BY FIELD(sch.day_of_week,'Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo'), sch.start_time`,
      [studentId]
    )

    return rows
  } catch (error) {
    throw new Error(`Error fetching schedule: ${error.message}`)
  }
}

// Crear un nuevo curso
export const createCourse = async (courseData) => {
    const { teacher_user_id, subject_id, section_id } = courseData
    // const { name, code, teacher_id, description } = courseData / OBSOLET CODE -- AC 02/01/2026

    try {
        const [result] = await db.query(
            'INSERT INTO teacher_assignments (teacher_user_id, subject_id, section_id) VALUES (?, ?, ?)',
            [teacher_user_id, subject_id, section_id]
        )
        return result

        /* OBSOLET CODE -- AC 02/01/2026
        const [result] = await connection.query(
            'INSERT INTO courses (name, code, teacher_id, description) VALUES (?, ?, ?, ?)',
            [name, code, teacher_id, description]
        )
        return result
        */

    } catch (error) {
        throw new Error(`Error creating course: ${error.message}`)
    }
}