export class subjectController{
    constructor({subjectModel}){
        this.model= subjectModel
    }
    // controlador para obtener todas las materias
    getAllSubjects = async(req, res) => {
        try{
            const result = await this.model.getAllSubjects()
            if (result.error) return res.status(404).json({
                error:result.error
            })
            return res.status(200).json({
                message:result.message, 
                subjects:result.subjects
            })
        }catch(error){
            return res.status(500).json({ error: "Error interno del servidor" })
        }
    }

    // controlador para crear una materia
    createSubject = async(req, res) => {
        try{
            const { anio, codigo, nombre, descripcion, is_active } = req.body
            if (!anio || !codigo || !nombre) {
                return res.status(400).json({ error: "Faltan campos requeridos: anio, codigo, nombre" })
            }
            const result = await this.model.createSubject({ anio, codigo, nombre, descripcion, is_active })
            return res.status(201).json(result)
        }catch(error){
            if (error.message === "Grado no encontrado") {
                return res.status(400).json({ error: error.message })
            }
            return res.status(500).json({ error: "Error interno del servidor" })
        }
    }

    // controlador para actualizar una materia
    updateSubject = async(req, res) => {
        try{
            const { subject_id } = req.params
            const { anio, codigo, nombre, descripcion, is_active } = req.body
            if (!anio || !codigo || !nombre) {
                return res.status(400).json({ error: "Faltan campos requeridos: anio, codigo, nombre" })
            }
            const result = await this.model.updateSubject(subject_id, { anio, codigo, nombre, descripcion, is_active })
            return res.status(200).json(result)
        }catch(error){
            if (error.message === "Grado no encontrado") {
                return res.status(400).json({ error: error.message })
            }
            return res.status(500).json({ error: "Error interno del servidor" })
        }
    }

    // controlador para eliminar una materia
    deleteSubject = async(req, res) => {
        try{
            const { subject_id } = req.params
            const result = await this.model.deleteSubject(subject_id)
            return res.status(200).json(result)
        }catch(error){
            return res.status(500).json({ error: "Error interno del servidor" })
        }
    }
}