import { db } from "../../../../database/db.database.mjs";

// Modelo que interactua con la tabla sections de la base de datos
export class SectionModel {
    // Método para obtener todas las secciones academicas
    static async getAllSections() {
        const [sections] = await db.query(
            `SELECT s.*, g.grade_name 
             FROM sections s
             JOIN grades g ON s.grade_id = g.grade_id
             JOIN academic_years ay ON s.academic_year_id = ay.year_id
             WHERE ay.is_active = 1
             ORDER BY s.grade_id ASC, s.section_name ASC`
        );
        if (sections.length === 0) return { error: 'No hay secciones registradas' };
        return {
            message: 'Secciones obtenidas correctamente',
            sections: sections
        }
    }

    // Método para obtener secciones por grado
    static async getSectionsByGrade(gradeId) {
        if (!gradeId) return { error: 'El ID del grado es requerido' };
        const [sections] = await db.query(
            `SELECT s.section_id, s.section_name, s.capacity, s.number_of_students, s.grade_id, g.grade_name
            FROM sections s
            JOIN grades g ON s.grade_id = g.grade_id
            JOIN academic_years ay ON s.academic_year_id = ay.year_id
            WHERE s.grade_id = ? AND ay.is_active = 1
            ORDER BY s.section_name ASC`,
            [gradeId]
        );
        if (sections.length === 0) return { error: 'No hay secciones para este grado' };
        return {
            message: 'Secciones obtenidas correctamente',
            sections: sections
        }
    }

    // Método para obtener una sección académica por su ID
    static async getSectionById(sectionId) {
        if (!sectionId) return { error: 'El ID de la sección es requerido' };
        const [section] = await db.query(
            `SELECT s.section_id, s.section_name, s.capacity, g.grade_name,
            ay.name
            FROM sections AS s JOIN grades AS g ON s.grade_id = g.grade_id
            JOIN academic_years AS ay ON s.academic_year_id = ay.year_id
            WHERE s.section_id = ?`,
            [sectionId]
        );
        // A su vez obtenemos los estudiantes asignados a la sección
        const [students] = await db.query(
            `SELECT u.user_id, CONCAT(u.first_name, ' ', u.last_name) AS student_name,
            u.email FROM users AS u JOIN enrollments AS e ON u.user_id = e.student_user_id
            WHERE e.section_id = ?`,
            [sectionId]
        )
        if (students.length === 0) return { error: 'No hay estudiantes asignados a esta sección' };
        if (section.length === 0) return { error: 'Sección no encontrada' };
        return {
            message: 'Sección obtenida correctamente',
            section: {
                ...section[0],
                students: students
            }
        }
    }

    // Método para crear una nueva sección académica
    static async createSection(data) {
        if (!data) return { error: 'Faltan datos para crear la sección' };
        const { grade_id, academic_year_id, ...rest } = data;
        // Se verifica si el grado existe y el año académico existe
        const [exisitingGrade] = await db.query(
            `SELECT * FROM grades WHERE grade_id = ?`,
            [grade_id]
        );
        const [existingAcademicYear] = await db.query(
            `SELECT * FROM academic_years WHERE year_id = ?`,
            [academic_year_id]
        );
        if (exisitingGrade.length === 0 || existingAcademicYear.length === 0) {
            return { error: 'Grado o año académico no encontrado' };
        }
        // Si existen, se crea la sección
        const [newSection] = await db.query(
            `INSERT INTO sections (grade_id, academic_year_id, section_name, capacity)
            VALUES (?, ?, ?, ?)`,
            [grade_id, academic_year_id, rest.section_name, rest.capacity || null]
        );
        // Se obtiene la sección creada
        const [createdSection] = await db.query(
            `SELECT * FROM sections WHERE section_id = ?`,
            [newSection.insertId]
        );
        if (createdSection.length === 0) return { error: 'Error al crear la sección' };
        return {
            message: 'Sección creada correctamente',
            section: createdSection
        }
    }

    // Método para actualizar una sección académica
    static async updateSection(sectionId, data) {
        if (!sectionId || !data) return { error: 'El ID de la sección y los datos son requeridos' };
        const allowedFields = ['section_name', 'capacity'];
        const updateToFields = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updateToFields[field] = data[field];
            }
        }

        // Se verifica si existe la sección
        const [existingSection] = await db.query(
            `SELECT * FROM sections WHERE section_id = ?`,
            [sectionId]
        );
        if (existingSection.length === 0) return { error: 'Sección no encontrada' };
        // Si existe, se procede a actualizarla
        const fields = [];
        const values = [];

        Object.entries(updateToFields).forEach(([key, value]) => {
            fields.push(`${key} = ?`);
            values.push(value);
        });
        values.push(sectionId); // Agrega el sectionId al final para la cláusula WHERE
        const [updatedSection] = await db.query(
            `UPDATE sections SET ${fields.join(', ')} WHERE section_id = ?`,
            values
        );
        if (updatedSection.affectedRows === 0) return { error: 'Error al actualizar la sección' };
        // Se obtiene la sección actualizada
        const [section] = await db.query(
            `SELECT * FROM sections WHERE section_id = ?`,
            [sectionId]
        );
        return {
            message: 'Sección actualizada correctamente',
            section: section
        }
    }

    // Método para borrar una sección académica
    static async deleteSection(sectionId) {
        if (!sectionId) return { error: 'El ID de la sección es requerido' };
        // Se verifica si la sección existe
        const [existingSection] = await db.query(
            `SELECT * FROM sections WHERE section_id = ?`,
            [sectionId]
        );
        if (existingSection.length === 0) return { error: 'Sección no encontrada' };
        // Si existe, se borra la sección
        await db.query(
            `DELETE FROM sections WHERE section_id = ?`,
            [sectionId]
        );
        return {
            message: 'Sección borrada correctamente'
        }
    }
}
