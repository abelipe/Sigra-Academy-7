import { db } from '../../../../database/db.database.mjs'

export class subjectModel{
    // metodo para obtener todas las materias
    static async getAllSubjects(){
        const [subjects] = await db.query(
            `SELECT s.subject_id, s.code_subject, s.subject_name, s.description, s.is_active, g.grade_name as anio
             FROM subjects s
             JOIN grades g ON s.grade_id = g.grade_id`
        )
        if(subjects.length==0) return {error:"No se han encontrado materias"}
        return { 
            message:"Se han obtenido las materias exitosamente",
            subjects:subjects
        }
    }

    // metodo para obtener grade_id por grade_name o id numérico
    static async getGradeIdByName(grade_name){
        if (!isNaN(grade_name)) {
            return parseInt(grade_name);
        }
        const [rows] = await db.query(
            "SELECT grade_id FROM grades WHERE grade_name = ?",
            [grade_name]
        )
        if(rows.length === 0) throw new Error("Grado no encontrado")
        return rows[0].grade_id
    }

    // metodo para crear una materia
    static async createSubject(data){
        const { anio, codigo, nombre, descripcion, is_active = 1 } = data
        const grade_id = await this.getGradeIdByName(anio)
        const [result] = await db.query(
            "INSERT INTO subjects (grade_id, code_subject, subject_name, description, is_active) VALUES (?, ?, ?, ?, ?)",
            [grade_id, codigo, nombre, descripcion, is_active]
        )
        return { 
            message: "Materia creada exitosamente",
            subject_id: result.insertId
        }
    }

    // metodo para actualizar una materia
    static async updateSubject(subject_id, data){
        const { anio, codigo, nombre, descripcion, is_active = 1 } = data
        const grade_id = await this.getGradeIdByName(anio)
        await db.query(
            "UPDATE subjects SET grade_id = ?, code_subject = ?, subject_name = ?, description = ?, is_active = ? WHERE subject_id = ?",
            [grade_id, codigo, nombre, descripcion, is_active, subject_id]
        )
        return { message: "Materia actualizada exitosamente" }
    }

    // metodo para eliminar una materia
    static async deleteSubject(subject_id){
        await db.query(
            "DELETE FROM subjects WHERE subject_id = ?",
            [subject_id]
        )
        return { message: "Materia eliminada exitosamente" }
    }
}