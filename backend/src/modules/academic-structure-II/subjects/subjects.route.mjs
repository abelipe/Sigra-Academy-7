import {Router} from "express" 
import { subjectController } from "./subjects.controller.mjs"
import { subjectModel } from "./subjects.model.mjs"


const router = Router()
const controller = new subjectController({subjectModel:subjectModel})

// ruta para obtener todas las materias
router.get("/all", controller.getAllSubjects)

// ruta para crear una materia
router.post("/create", controller.createSubject)

// ruta para actualizar una materia
router.put("/update/:subject_id", controller.updateSubject)

// ruta para eliminar una materia
router.delete("/delete/:subject_id", controller.deleteSubject)

export const subjectRoute = router
