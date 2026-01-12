import {z} from 'zod';

// Esquema para la creación de una asignación de curso a profesor
const createSchemaAssignment = z.object({
    teacher_user_id: z.number().int().positive(),
    subject_id: z.number().int().positive(),
    section_id: z.number().int().positive()
});


// Función para validar los datos de creación de una asignación
export function validateCreateAssignment(data){
    return createSchemaAssignment.safeParse(data);
}

// Función para validar los datos de actualización de una asignación
export function validateUpdateAssignment(data){
    return createSchemaAssignment.partial().safeParse(data);
}