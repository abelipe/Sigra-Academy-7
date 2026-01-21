import { db } from "../../../../database/db.database.mjs";

// Modelo que interactúa con la tabla teacher_assignments (cursos asignados a profesores)
export class TeacherAssignmentModel {
    // Obtener cursos asignados a un estudiante
    static async getCoursesByStudentId(studentId) {
        if (!studentId) return { error: 'El ID del estudiante es requerido' };
        // Se verifica que el estudiante exista
        const [existingStudent] = await db.query(
            `SELECT * FROM users WHERE user_id = ?`,
            [studentId]
        );
        if (existingStudent.length === 0) return { error: 'Estudiante no encontrado' };
        // Si existe, se obtienen los cursos asignados
        const [courses] = await db.query(
            `SELECT ta.assignment_id, s.subject_name, sec.section_name, g.grade_name,
            ay.name AS academic_year FROM enrollments e JOIN sections sec ON e.section_id = sec.section_id
            JOIN grades g ON sec.grade_id = g.grade_id
            JOIN academic_years ay ON sec.academic_year_id = ay.year_id
            JOIN teacher_assignments ta ON ta.section_id = sec.section_id
            JOIN subjects s ON ta.subject_id = s.subject_id
            WHERE e.student_user_id = ?`,
            [studentId]
        );
        if (courses.length === 0) return { error: 'No se encontraron cursos asignados para este estudiante' };
        return {
            message: 'Cursos asignados obtenidos exitosamente',
            courses: courses
        };
    }

    // Método para obtener todos los cursos asignados a un profesor
    static async getCourseByTeacherId(teacherId) {
        if (!teacherId) return { error: 'El ID del profesor es requerido' };
        // Se verifica que el profesor exista
        const [existingTeacher] = await db.query(
            `SELECT u.* FROM users u JOIN roles r ON u.role_id = r.role_id
            WHERE u.user_id = ? AND r.role_name = 'Docente'`,
            [teacherId]
        );
        if (existingTeacher.length === 0) return { error: 'Profesor no encontrado' };
        // Si existe, se obtienen los cursos asignados
        const [courses] = await db.query(
            `SELECT ta.assignment_id, s.subject_name, sec.section_name, g.grade_name,
            ay.name, act.title, act.due_date, act.weight_percentage, CONCAT(u.first_name, ' ', u.last_name) AS teacher_name
            FROM teacher_assignments ta JOIN subjects s ON ta.subject_id = s.subject_id
            JOIN sections sec ON ta.section_id = sec.section_id
            JOIN grades g ON sec.grade_id = g.grade_id
            JOIN users u ON ta.teacher_user_id = u.user_id
            JOIN academic_years ay ON sec.academic_year_id = ay.year_id
            LEFT JOIN activities act ON ta.assignment_id = act.assignment_id
            WHERE ta.teacher_user_id = ?`,
            [teacherId]
        );
        if (courses.length === 0) return { error: 'No se encontraron cursos asignados para este profesor' };
        return {
            message: 'Cursos asignados obtenidos exitosamente',
            courses: courses
        };
    }

    // Método para obtener todos los cursos asignados a una sección
    static async getCoursesBySectionId(sectionId) {
        if (!sectionId) return { error: 'El ID de la sección es requerido' };
        // Se verifica que la sección exista
        const [existingSection] = await db.query(
            `SELECT * FROM sections WHERE section_id = ?`,
            [sectionId]
        );
        if (existingSection.length === 0) return { error: 'Sección no encontrada' };
        // Si existe, se obtienen los cursos asignados
        const [courses] = await db.query(
            `SELECT ta.assignment_id, s.subject_name, sec.section_name, g.grade_name,
            ay.name AS academic_year, CONCAT(u.first_name, ' ', u.last_name) AS teacher_name
            FROM teacher_assignments ta JOIN subjects s ON ta.subject_id = s.subject_id
            JOIN sections sec ON ta.section_id = sec.section_id
            JOIN grades g ON sec.grade_id = g.grade_id
            JOIN academic_years ay ON sec.academic_year_id = ay.year_id
            JOIN users u ON ta.teacher_user_id = u.user_id
            WHERE ta.section_id = ?`,
            [sectionId]
        );
        if (courses.length === 0) return { error: 'No se encontraron cursos asignados para esta sección' };
        return {
            message: 'Cursos asignados obtenidos exitosamente',
            courses: courses
        }
    }

    // Método para obtener detalles de un curso asignado por su ID
    static async getCourseByID(assignmentId) {
        if (!assignmentId) return { error: 'El ID de la asignación es requerido' };
        const [courseDetails] = await db.query(
            `SELECT ta.assignment_id, s.subject_name,sec.section_id, sec.section_name, g.grade_name,
            ay.name AS academic_year, CONCAT(u.first_name, ' ', u.last_name) AS teacher_name,
            act.title AS activity_title, act.due_date AS activity_due_date, act.weight_percentage AS activity_weight
            FROM teacher_assignments ta JOIN subjects s ON ta.subject_id = s.subject_id
            JOIN sections sec ON ta.section_id = sec.section_id
            JOIN grades g ON sec.grade_id = g.grade_id
            JOIN activities act ON ta.assignment_id = act.assignment_id
            JOIN academic_years ay ON sec.academic_year_id = ay.year_id
            JOIN users u ON ta.teacher_user_id = u.user_id
            WHERE ta.assignment_id = ?`,
            [assignmentId]
        );
        // Además Obtengo los estudiantes inscritos en esa asignación
        const [students] = await db.query(
            `SELECT u.user_id, CONCAT(u.first_name, ' ', u.last_name) as student_name
            FROM enrollments e JOIN users u ON e.student_user_id = u.user_id
            WHERE e.section_id = ?`,
            [courseDetails[0].section_id]
        );
        // Y las actividades asociadas a esa asignación
        const [activities] = await db.query(
            `SELECT * FROM activities WHERE assignment_id = ? AND is_visible = 1`,
            [assignmentId]
        );
        if (courseDetails.length === 0) return { error: 'No se encontraron detalles para esta asignación' };
        return {
            message: 'Detalles de la asignación obtenidos exitosamente',
            course: {
                ...courseDetails[0],
                students: students,
                activities: activities
            }
        }
    }

    // Método para obtener todas las actividades de una asignación
    static async getActivitiesByAssignmentID(assignmentId) {
        if (!assignmentId) return { error: 'El ID de la asignación es requerido' };
        // Se verifica que la asignación exista
        const [existingAssignment] = await db.query(
            `SELECT * FROM teacher_assignments WHERE assignment_id = ?`,
            [assignmentId]
        );
        if (existingAssignment.length === 0) return { error: 'Asignación no encontrada' };
        // Si existe, se obtienen las actividades asociadas
        const [activities] = await db.query(
            `SELECT * FROM activities WHERE assignment_id = ? AND is_active = 1
            ORDER BY due_date DESC`,
            [assignmentId]
        );
        if (activities.length === 0) return { error: 'No se encontraron actividades para esta asignación' };
        return {
            message: 'Actividades obtenidas exitosamente',
            activities: activities
        }
    }

    // Método para obtener las personas relacionadas a una asignación (profesor y estudiantes)
    static async getPeopleByAssignmentID(assignmentId) {
        if (!assignmentId) return { error: 'El ID de la asignación es requerido' };
        // Se verifica que la asignación exista
        const [existingAssignment] = await db.query(
            `SELECT * FROM teacher_assignments WHERE assignment_id = ?`,
            [assignmentId]
        );
        if (existingAssignment.length === 0) return { error: 'Asignación no encontrada' };
        // Si existe, se obtiene el profesor y la asignación
        const [assignment] = await db.query(
            `SELECT ta.section_id, u.user_id, CONCAT(u.first_name, ' ', u.last_name) as name, 'Docente' as role
            FROM teacher_assignments ta JOIN users u ON ta.teacher_user_id = u.user_id
            WHERE ta.assignment_id = ?`,
            [assignmentId]
        );
        if (assignment.length === 0) return { error: 'No se encontró el profesor para esta asignación' };
        // A su vez se obtienen los estudiantes de esa sección
        const [students] = await db.query(
            `SELECT u.user_id, CONCAT(u.first_name, ' ', u.last_name) as name, 'Estudiante' as role
            FROM enrollments e JOIN users u ON e.student_user_id = u.user_id
            WHERE e.section_id = ?`,
            [assignment[0].section_id]
        );
        if (students.length === 0) return { error: 'No se encontraron estudiantes para esta asignación' };
        return {
            message: 'Personas relacionadas obtenidas exitosamente',
            people: {
                teacher: assignment[0],
                students: students
            }
        }
    }

    // Método para crear un nuevo curso asignado
    static async createAssignement(data) {
        if (!data) return { error: 'Los datos de la asignación son requeridos' };
        const { teacher_user_id, subject_id, section_id } = data;
        // Se verifica que el profesor, la materia y la sección existan
        const [existingTeacher] = await db.query(
            `SELECT u.*, r.role_name FROM users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE u.user_id = ? AND r.role_name = 'Docente'`,
            [teacher_user_id]
        );
        const [existingSubject] = await db.query(
            `SELECT * FROM subjects WHERE subject_id = ?`,
            [subject_id]
        );
        const [existingSection] = await db.query(
            `SELECT * FROM sections WHERE section_id = ?`,
            [section_id]
        );
        if (existingTeacher.length === 0) return { error: 'Profesor no encontrado' };
        if (existingSubject.length === 0) return { error: 'Materia no encontrada' };
        if (existingSection.length === 0) return { error: 'Sección no encontrada' };
        // Si todo es válido, se procede a crear la asignación
        const [result] = await db.query(
            `INSERT INTO teacher_assignments (teacher_user_id, subject_id, section_id)
            VALUES (?, ?, ?)`, [teacher_user_id, subject_id, section_id]
        );
        // Se obtienen los detalles de la nueva asignación creada
        const [newAssignment] = await db.query(
            `SELECT ta.assignment_id, s.subject_name, sec.section_name, g.grade_name,
            ay.name AS academic_year, CONCAT(u.first_name, ' ', u.last_name) AS teacher_name
            FROM teacher_assignments ta JOIN subjects s ON ta.subject_id = s.subject_id
            JOIN sections sec ON ta.section_id = sec.section_id
            JOIN grades g ON sec.grade_id = g.grade_id
            JOIN academic_years ay ON sec.academic_year_id = ay.year_id
            JOIN users u ON ta.teacher_user_id = u.user_id
            WHERE ta.assignment_id = ?`,
            [result.insertId]
        );
        return {
            message: 'Asignación creada exitosamente',
            assignment: newAssignment[0]
        }
    }

    // Método para actualizar una asignación por su ID
    static async updateAssignmentByID(assignmentId, data) {
        if (!assignmentId || !data) return { error: 'El ID de la asignación y los datos son requeridos' };
        const allowedFields = ['teacher_user_id', 'subject_id', 'section_id'];
        const fieldsToupdate = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fieldsToupdate[field] = data[field];
            }
        }
        // Se verifica que la asignación exista
        const [existingAssignment] = await db.query(
            `SELECT * FROM teacher_assignments WHERE assignment_id = ?`,
            [assignmentId]
        );
        if (existingAssignment.length === 0) return { error: 'Asignación no encontrada' };
        // Si existe, se procede a actualizarla
        const fields = [];
        const values = [];

        Object.entries(fieldsToupdate).forEach(([key, value]) => {
            fields.push(`${key} = ?`);
            values.push(value);
        });
        values.push(assignmentId); // Para la cláusula WHERE
        const [updatedAssignment] = await db.query(
            `UPDATE teacher_assignments SET ${fields.join(', ')} WHERE assignment_id = ?`,
            values
        );
        // Se obtienen los detalles actualizados de la asignación
        const [assignmentDetails] = await db.query(
            `SELECT ta.assignment_id, CONCAT(u.first_name, ' ', u.last_name) AS teacher_name, s.subject_name, sec.section_name, g.grade_name FROM
            teacher_assignments ta JOIN subjects s ON ta.subject_id = s.subject_id
            JOIN sections sec ON ta.section_id = sec.section_id
            JOIN grades g ON sec.grade_id = g.grade_id
            JOIN users u ON ta.teacher_user_id = u.user_id
            WHERE ta.assignment_id = ?`,
            [assignmentId]
        );
        if (assignmentDetails.length === 0) return { error: 'Error al obtener los detalles de la asignación actualizada' };
        return {
            message: 'Asignación actualizada exitosamente',
            assignment: assignmentDetails[0]
        }
    }

    // Método para eliminar una asignación por su ID
    static async deleteAssignmentByID(assignmentId) {
        if (!assignmentId) return { error: 'El ID de la asignación es requerido' };
        // Se verifica que la asiganación exista
        const [existingAssignment] = await db.query(
            `SELECT * FROM teacher_assignments WHERE assignment_id = ?`,
            [assignmentId]
        );
        if (existingAssignment.length === 0) return { error: 'Asignación no encontrada' };
        // Si existe, se procede a eliminarla
        await db.query(
            `DELETE FROM teacher_assignments WHERE assignment_id = ?`,
            [assignmentId]
        );
        return {
            message: 'Asignación eliminada exitosamente'
        }
    }
}
