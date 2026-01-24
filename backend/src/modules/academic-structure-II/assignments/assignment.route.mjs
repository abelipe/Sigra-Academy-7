import { Router } from "express";
import { AssignmentController } from "./assignment.controller.mjs";
import { AssignmentModel } from "./assignment.model.mjs";

const router = Router();
const assignmentController = new AssignmentController({ assignmentModel: AssignmentModel });

// Estudiantes
router.get("/unassigned-students/:academicYearId", assignmentController.getUnassignedStudents);
router.get("/assigned-students/:sectionId", assignmentController.getAssignedStudents);

// Profesores
router.get("/teachers", assignmentController.getAllTeachers);
router.get("/unassigned-teachers/:sectionId", assignmentController.getUnassignedTeachers);
router.get("/assigned-teachers/:sectionId", assignmentController.getAssignedTeachers);
router.post("/assign-teacher", assignmentController.assignTeacher);
router.delete("/unassign-teacher/:assignmentId", assignmentController.unassignTeacher);

export const academicAssignmentRoute = router;
