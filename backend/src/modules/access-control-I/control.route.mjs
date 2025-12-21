import express from 'express'
import { getUser, getUserByName } from './control.controller.mjs'
import { validateGetUser, validateGetUserName } from './control.schema.mjs'

const router = express.Router()

// GET /users/:id  -> devuelve usuario por user_id
router.get('/users/:id', validateGetUser, getUser)

// GET /users/name/:name -> devuelve usuario buscando por nombre (first_name o last_name)
router.get('/users/name/:name', validateGetUserName, getUserByName)

export default router

