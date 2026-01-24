import { Router } from "express"
import { subjectController } from "./subjects.controller.mjs"
import { subjectModel } from "./subjects.model.mjs"


const router = Router()
const controller = new subjectController({ subjectModel: subjectModel })

// Ruta para obtener todas las materias
// Ruta para obtener todas las materias
router.get("/all", controller.getAllSubjects)
// También permitir GET / to listar materias (comodidad)
router.get("/", controller.getAllSubjects)
// Ruta para obtener materias por grado
router.get("/grade/:gradeId", controller.getSubjectsByGrade)
// Ruta para obtener una materia por su ID
router.get("/subject/:subjectId", controller.getSubjectById)
// Ruta para crear una materia
router.post("/create", controller.createSubject)
// Ruta para actualizar una materia
router.put("/update/:subjectId", controller.updateSubject)
// Ruta para eliminar una materia
router.delete("/delete/:subjectId", controller.deleteSubject)

export const subjectRoute = router
