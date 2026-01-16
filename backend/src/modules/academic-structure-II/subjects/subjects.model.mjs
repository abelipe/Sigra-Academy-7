import { db } from '../../../../database/db.database.mjs'

export class subjectModel {
    // metodo para obtener todas las materias
    static async getAllSubjects() {
        const [subjects] = await db.query(
            `SELECT s.*, g.grade_name
             FROM subjects s
             JOIN grades g ON s.grade_id = g.grade_id`
        )
        if (subjects.length === 0) return { error: "No se han encontrado materias" }

        // Map grade_name to anio for frontend compatibility
        const mappedSubjects = subjects.map(subject => ({
            ...subject,
            anio: subject.grade_name
        }));

        return {
            message: "Se han obtenido las materias exitosamente",
            subjects: mappedSubjects
        }
    }

    // metodo para obtener una materia con su respectivo grado por su ID
    static async getSubjectById(subjectId) {
        if (!subjectId) return { error: "El ID de la materia es requerido" }
        const [subject] = await db.query(
            `SELECT s.*, g.grade_name
             FROM subjects s
             JOIN grades g ON s.grade_id = g.grade_id
             WHERE s.subject_id = ?`,
            [subjectId]
        );
        if (subject.length === 0) return { error: "Materia no encontrada" }

        // Map grade_name to anio for frontend compatibility
        const mappedSubject = {
            ...subject[0],
            anio: subject[0].grade_name
        };

        return {
            message: "Materia obtenida exitosamente",
            subject: mappedSubject
        }
    }

    // metodo para crear una materia
    static async createSubject(data) {
        if (!data) return { error: 'Faltan datos para crear la materia' };

        // Convert anio to grade_id if provided
        if (data.anio !== undefined) {
            data.grade_id = parseInt(data.anio);
            delete data.anio;
        }

        const { grade_id, ...rest } = data;
        // Se verifica si el grado existe
        const [existingGrade] = await db.query(
            `SELECT * FROM grades WHERE grade_id = ?`,
            [grade_id]
        );
        // A su vez, se verfica si ya existe una materia con el mismo nombre o codigo
        const [exisitingSubject] = await db.query(
            `SELECT * FROM subjects WHERE subject_name = ? OR code_subject = ?`,
            [rest.subject_name, rest.code_subject]
        );
        if (existingGrade.length === 0 || exisitingSubject.length > 0) {
            return { error: 'Grado no encontrado o materia ya existe' };
        }
        // Si todo esta bien, se crea la materia
        const [result] = await db.query(
            `INSERT INTO subjects (grade_id, subject_name, code_subject, description)
            VALUES (?, ?, ?, ?)`,
            [grade_id, rest.subject_name, rest.code_subject, rest.description]
        );
        // Se obtiene la materia creada con grade_name
        const [createdSubject] = await db.query(
            `SELECT s.*, g.grade_name
             FROM subjects s
             JOIN grades g ON s.grade_id = g.grade_id
             WHERE s.subject_id = ? LIMIT 1`,
            [result.insertId]
        );
        if (createdSubject.length === 0) return { error: 'Error al crear la materia' };

        // Map grade_name to anio for frontend compatibility
        const mappedSubject = {
            ...createdSubject[0],
            anio: createdSubject[0].grade_name
        };

        return {
            message: 'Materia creada correctamente',
            subject: mappedSubject
        }
    }

    // metodo para actualizar una materia
    static async updateSubject(subjectId, data) {
        if (!subjectId || !data) return { error: 'Faltan datos para actualizar la materia' };

        // Convert anio to grade_id if provided
        if (data.anio !== undefined) {
            // anio comes as a string number ("1", "2", etc.) from frontend
            data.grade_id = parseInt(data.anio);
            delete data.anio; // Remove anio from data object
        }

        // Designó los campos que se va actualizar
        const allowedFields = ['grade_id', 'subject_name', 'code_subject', 'description', 'is_active'];
        const updateToFields = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updateToFields[field] = data[field];
            }
        }

        // If no fields to update, return error
        if (Object.keys(updateToFields).length === 0) {
            return { error: 'No hay campos para actualizar' };
        }

        // Se verifica si la materia existe
        const [existingSubject] = await db.query(
            `SELECT * FROM subjects WHERE subject_id = ?`,
            [subjectId]
        );
        if (existingSubject.length === 0) return { error: 'Materia no encontrada' };
        // Si existe, se procede a actualizarlo
        const fields = [];
        const values = [];

        Object.entries(updateToFields).forEach(([key, value]) => {
            fields.push(`${key} = ?`);
            values.push(value);
        });
        values.push(subjectId); // Agrega el subject_id al final para la cláusula WHERE

        const [updatedSubject] = await db.query(
            `UPDATE subjects SET ${fields.join(', ')} WHERE subject_id = ?`,
            values
        );
        if (updatedSubject.affectedRows === 0) return { error: 'Error al actualizar la materia' };
        // Se obtiene la materia actualizada con grade_name
        const [subject] = await db.query(
            `SELECT s.*, g.grade_name
             FROM subjects s
             JOIN grades g ON s.grade_id = g.grade_id
             WHERE s.subject_id = ? LIMIT 1`,
            [subjectId]
        );

        // Map grade_name to anio for frontend compatibility
        const mappedSubject = {
            ...subject[0],
            anio: subject[0].grade_name
        };

        return {
            message: 'Materia actualizada correctamente',
            subject: mappedSubject
        }
    }

    // metodo para eliminar una materia
    static async deleteSubject(subjectId) {
        if (!subjectId) return { error: 'El ID de la materia es requerido' };
        // Se verifica si existe la materia
        const [existingSubject] = await db.query(
            `SELECT * FROM subjects WHERE subject_id = ?`,
            [subjectId]
        );
        if (existingSubject.length === 0) return { error: 'Materia no encontrada' };
        // Si existe, se elimina la materia
        const [deletedSubject] = await db.query(
            `DELETE FROM subjects WHERE subject_id = ?`,
            [subjectId]
        );
        if (deletedSubject.affectedRows === 0) return { error: 'Error al eliminar la materia' };
        return { message: "Materia eliminada exitosamente" }
    }
}