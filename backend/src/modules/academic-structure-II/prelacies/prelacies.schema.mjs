import { z } from "zod";

// Esquema de validación para la creación de una prelatura
const createPrelacySchema = z.object({
	subject_id: z.number().int().positive(),
	subject_prerequisites_id: z.number().int().positive().nullable().optional(),
	prerequisite_id: z.number().int().positive().nullable().optional()
}).refine(data => data.subject_prerequisites_id !== undefined || data.prerequisite_id !== undefined, {
	message: "Debe proporcionar subject_prerequisites_id o prerequisite_id"
});

// Función para validar los datos de creación de una prelatura
export function validateCreatePrelacy(data) {
	return createPrelacySchema.safeParse(data);
}

