import { z } from 'zod'

// Esquema para validar params de GET /users/:id
export const getUserParamsSchema = z.object({
  id: z.coerce.number().int().positive()
})

export function validateGetUser(req, res, next) {
  const result = getUserParamsSchema.safeParse(req.params)
  if (!result.success) {
    return res.status(400).json({ message: 'Invalid parameters', errors: result.error.errors })
  }

  // Reemplazamos el id en params por su versión numérica
  req.params.id = result.data.id
  return next()
}

// Esquema para validar params de GET /users/name/:name
export const getUserNameParamsSchema = z.object({
  name: z.string().min(1)
})

export function validateGetUserName(req, res, next) {
  const result = getUserNameParamsSchema.safeParse(req.params)
  if (!result.success) {
    return res.status(400).json({ message: 'Invalid parameters', errors: result.error.errors })
  }

  req.params.name = result.data.name
  return next()
}

export default { getUserParamsSchema, validateGetUser }
