import express from 'express'
import { getUser, getUserByName, getUserByEmail } from './control.controller.mjs'
import { validateGetUser, validateGetUserName, validateGetUserEmail } from './control.schema.mjs'

const router = express.Router()

// GET /users/:id  -> devuelve usuario por user_id
router.get('/users/:id', validateGetUser, getUser)

// GET /users/name/:name -> devuelve usuario buscando por nombre (first_name o last_name)
router.get('/users/name/:name', validateGetUserName, getUserByName)

// GET /users/email/:email -> devuelve usuario por email
router.get('/users/email/:email', validateGetUserEmail, getUserByEmail)

export default router

