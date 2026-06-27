import { Router } from 'express';

import {
  createNote,
  deleteNote,
  getAllNotes,
  getNoteById,
  updateNote,
} from '../controllers/notesController.js';

export const notesRoutes = Router();

notesRoutes.get('/notes', getAllNotes);
notesRoutes.get('/notes/:noteId', getNoteById);
notesRoutes.post('/notes', createNote);
notesRoutes.delete('/notes/:noteId', deleteNote);
notesRoutes.patch('/notes/:noteId', updateNote);
