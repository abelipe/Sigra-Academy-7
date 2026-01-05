import { Router } from 'express';
import * as controller from './prelacies.controller.mjs';

const router = Router();

// GET / -> list subjects (excluding 5th year)
router.get('/', controller.listSubjects);

// GET /search?q=term
router.get('/search', controller.search);

// GET /:subjectId/prerequisites
router.get('/:subjectId/prerequisites', controller.getPrereqs);

// POST / -> create prerequisite
router.post('/', controller.create);

// DELETE /:id -> delete prereq row
router.delete('/:id', controller.remove);
// DELETE /subject/:subjectId -> delete all prereqs for a subject
router.delete('/subject/:subjectId', controller.removeBySubject);

// GET /all -> all prerequisite rows
router.get('/all', controller.allPrereqs);

// GET /summary -> grouped summary per subject (only subjects that have prereqs)
router.get('/summary', controller.summary);

export const prelaciesRoute = router;

