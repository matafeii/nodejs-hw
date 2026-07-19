import { celebrate } from 'celebrate';
import { Router } from 'express';

import {
  loginUser,
  logoutUser,
  requestResetEmail,
  resetPassword,
  refreshUserSession,
  registerUser,
} from '../controllers/authController.js';
import {
  loginUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
  registerUserSchema,
} from '../validations/authValidation.js';

const authRoutes = Router();

authRoutes.post('/auth/register', celebrate(registerUserSchema), registerUser);
authRoutes.post('/auth/login', celebrate(loginUserSchema), loginUser);
authRoutes.post('/auth/refresh', refreshUserSession);
authRoutes.post('/auth/logout', logoutUser);
authRoutes.post(
  '/auth/request-reset-email',
  celebrate(requestResetEmailSchema),
  requestResetEmail,
);
authRoutes.post(
  '/auth/reset-password',
  celebrate(resetPasswordSchema),
  resetPassword,
);

export default authRoutes;
