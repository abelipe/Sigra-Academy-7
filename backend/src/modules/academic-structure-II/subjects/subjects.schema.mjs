import { z } from "zod";

// Esquema de validación para la creación de una materia
const createSubjectSchema = z.object({
    grade_id: z.number().int().positive().optional(),
    anio: z.union([z.string(), z.number()]).optional(), // Accept anio as string or number
    subject_name: z.string().min(1).max(100),
    code_subject: z.string().min(1).max(20),
    description: z.string().max(255).optional(),
    is_active: z.union([z.boolean(), z.number()]).optional() // Accept boolean or number (0/1)
}).refine((data) => data.grade_id || data.anio, {
    message: "Debe proporcionar grade_id o anio"
});

// Esquema de validación para la actualización de una materia
const updateSubjectSchema = z.object({
    grade_id: z.number().int().positive().optional(),
    anio: z.union([z.string(), z.number()]).optional(), // Accept anio as string or number
    subject_name: z.string().min(1).max(100).optional(),
    code_subject: z.string().min(1).max(20).optional(),
    description: z.string().max(255).optional(),
    is_active: z.union([z.boolean(), z.number()]).optional() // Accept boolean or number (0/1)
});

// Función para validar los datos de creación de una materia
export function validateCreateSubject(data) {
    return createSubjectSchema.safeParse(data);
}

// Función para validar los datos de actualización de una materia
export function validateUpdateSubject(data) {
    return updateSubjectSchema.partial().safeParse(data);
}