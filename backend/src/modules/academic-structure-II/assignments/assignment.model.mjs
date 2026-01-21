import { db } from "../../../../database/db.database.mjs";

export class AssignmentModel {
    // Obtener estudiantes no asignados a ninguna sección en un año académico específico
    static async getUnassignedStudents(academicYearId) {
        if (!academicYearId) return { error: 'El ID del año académico es requerido' };

        const [students] = await db.query(
            `SELECT u.user_id, CONCAT(u.first_name, ' ', u.last_name) AS name, u.email
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             WHERE r.role_name = 'Estudiante'
             AND u.user_id NOT IN (
                 SELECT e.student_user_id
                 FROM enrollments e
                 JOIN sections s ON e.section_id = s.section_id
                 WHERE s.academic_year_id = ?
             )`,
            [academicYearId]
        );

        return {
            message: 'Estudiantes no asignados obtenidos exitosamente',
            students
        };
    }

    // Obtener estudiantes asignados a una sección específica
    static async getAssignedStudents(sectionId) {
        if (!sectionId) return { error: 'El ID de la sección es requerido' };

        const [students] = await db.query(
            `SELECT u.user_id, CONCAT(u.first_name, ' ', u.last_name) AS name, u.email, e.enrollment_id, e.status
             FROM users u
             JOIN enrollments e ON u.user_id = e.student_user_id
             WHERE e.section_id = ?`,
            [sectionId]
        );

        return {
            message: 'Estudiantes asignados obtenidos exitosamente',
            students
        };
    }

    // Obtener profesores no asignados a una sección específica
    // (Profesores que no tienen ninguna asignación en esta sección todavía)
    static async getUnassignedTeachers(sectionId) {
        if (!sectionId) return { error: 'El ID de la sección es requerido' };

        const [teachers] = await db.query(
            `SELECT u.user_id, CONCAT(u.first_name, ' ', u.last_name) AS name, u.email
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             WHERE r.role_name = 'Docente'
             AND u.user_id NOT IN (
                 SELECT ta.teacher_user_id
                 FROM teacher_assignments ta
                 WHERE ta.section_id = ?
             )`,
            [sectionId]
        );

        return {
            message: 'Profesores no asignados obtenidos exitosamente',
            teachers
        };
    }

    // Obtener profesores asignados a una sección específica (con sus materias)
    static async getAssignedTeachers(sectionId) {
        if (!sectionId) return { error: 'El ID de la sección es requerido' };

        const [teachers] = await db.query(
            `SELECT u.user_id, CONCAT(u.first_name, ' ', u.last_name) AS name, u.email,
                    ta.assignment_id, s.subject_name, s.subject_id
             FROM users u
             JOIN teacher_assignments ta ON u.user_id = ta.teacher_user_id
             JOIN subjects s ON ta.subject_id = s.subject_id
             WHERE ta.section_id = ?`,
            [sectionId]
        );

        return {
            message: 'Profesores asignados obtenidos exitosamente',
            teachers
        };
    }

    // Asignar un profesor a una materia en una sección
    static async assignTeacher(data) {
        const { teacher_user_id, subject_id, section_id } = data;
        if (!teacher_user_id || !subject_id || !section_id) {
            return { error: 'Todos los campos son requeridos (profesor, materia, sección)' };
        }

        // Verificar si ya existe la asignación
        const [existing] = await db.query(
            `SELECT * FROM teacher_assignments WHERE subject_id = ? AND section_id = ?`,
            [subject_id, section_id]
        );

        if (existing.length > 0) {
            return { error: 'Ya hay un profesor asignado a esta materia en esta sección' };
        }

        const [result] = await db.query(
            `INSERT INTO teacher_assignments (teacher_user_id, subject_id, section_id)
             VALUES (?, ?, ?)`,
            [teacher_user_id, subject_id, section_id]
        );

        return {
            message: 'Profesor asignado exitosamente',
            assignment_id: result.insertId
        };
    }

    // Desasignar un profesor
    static async unassignTeacher(assignmentId) {
        if (!assignmentId) return { error: 'ID de asignación requerido' };

        const [result] = await db.query(
            `DELETE FROM teacher_assignments WHERE assignment_id = ?`,
            [assignmentId]
        );

        if (result.affectedRows === 0) return { error: 'No se encontró la asignación' };

        return { message: 'Asignación eliminada exitosamente' };
    }
}
