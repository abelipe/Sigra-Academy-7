import { z } from 'zod';

// Esquema para validar la creación de un registro académico final (Cierre de nota)
const createRecordSchema = z.object({
    student_user_id: z.number().int().positive(),
    assignment_id: z.number().int().positive(),
    // Asumiendo escala 0-20 (común en Venezuela) o 0-100 según tu sistema
    final_score: z.number().min(0, "La nota mínima es 0").max(20, "La nota máxima es 20")
});

// Esquema para validar la actualización (por si hay que corregir una nota)
const updateRecordSchema = z.object({
    final_score: z.number().min(0).max(20).optional(),
    status: z.enum(['Aprobado', 'Aplazado']).optional()
});

export function validateCreateRecord(data) {
    return createRecordSchema.safeParse(data);
}

export function validateUpdateRecord(data) {
    return updateRecordSchema.partial().safeParse(data);
}