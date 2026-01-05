import { Router } from "express";
import {
	ctrlListarGrados,
	ctrlListarMateriasCatalogo,
	ctrlObtenerMateriasPorGrado,
	ctrlAsignarMateriaAGrado,
	ctrlAsignacionMasiva,
	ctrlReemplazarMateriasDeGrado,
	ctrlDesasignarMateriaDeGrado,
} from "./management.controller.mjs";

const router = Router();

router.get("/ping", (req, res) => {
	return res.status(200).json({ ok: true, mensaje: "management.route OK" });
});

router.get("/grados", ctrlListarGrados);
router.get("/materias", ctrlListarMateriasCatalogo);

router.get("/grados/:gradeId/materias", ctrlObtenerMateriasPorGrado);
router.post("/grados/:gradeId/materias/:subjectId", ctrlAsignarMateriaAGrado);
router.post("/grados/:gradeId/materias", ctrlAsignacionMasiva);
router.put("/grados/:gradeId/materias", ctrlReemplazarMateriasDeGrado);
router.delete(
	"/grados/:gradeId/materias/:subjectId",
	ctrlDesasignarMateriaDeGrado
);

export default router;
