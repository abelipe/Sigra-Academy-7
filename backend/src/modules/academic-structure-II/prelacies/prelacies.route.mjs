import { Router } from 'express';
import { ModelPrelacy } from './prelacies.model.mjs';
import { PrelaciesController } from './prelacies.controller.mjs';

const router = Router();
const controller = new PrelaciesController({ ModelPrelacy: ModelPrelacy });

// Base route - get all subjects (frontend calls GET /api/prelacies)
router.get('/', controller.getAllSubjects);

// Search subjects by query (frontend calls GET /api/prelacies/search?q=...)
router.get('/search', controller.searchSubjects);

// Get summary of all prelacies grouped by subject
router.get('/summary', controller.getSummary);

// Get all prelacies
router.get('/all', controller.getAllPrelacies);

// Get subject's prerequisites (frontend calls GET /api/prelacies/:subjectId/prerequisites)
router.get('/:subjectId/prerequisites', controller.getPrelaciesBySubjectId);

// Get subject by ID
router.get('/subjects/:subjectId', controller.getSubjectById);

// Create a prelacy (frontend calls POST /api/prelacies - not /create)
router.post('/', controller.createPrelacy);

// Delete all prerequisites for a subject (frontend calls DELETE /api/prelacies/subject/:subjectId)
router.delete('/subject/:subjectId', controller.deletePrelaciesBySubject);

// Delete a specific prelacy (frontend calls DELETE /api/prelacies/:prelacyId)
router.delete('/:prelacyId', controller.deletePrelacy);

export const prelaciesRoute = router;

