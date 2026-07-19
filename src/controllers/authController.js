import fs from 'node:fs/promises';

import bcrypt from 'bcrypt';
import handlebars from 'handlebars';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { isValidObjectId } from 'mongoose';

import { Session } from '../models/session.js';
import { User } from '../models/user.js';
import {
  clearSessionCookies,
  createSession,
  setSessionCookies,
} from '../services/auth.js';
import { sendEmail } from '../utils/sendMail.js';

const resetPasswordEmailTemplatePath = new URL(
  '../templates/reset-password-email.html',
  import.meta.url,
);

const passwordResetSuccessMessage = {
  message: 'Password reset email sent successfully',
};

export const registerUser = async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createHttpError(400, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password: hashedPassword,
  });
  const session = await createSession(user._id);

  setSessionCookies(res, session);

  res.status(201).json(user);
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid credentials');
  }

  await Session.deleteMany({ userId: user._id });
  const session = await createSession(user._id);

  setSessionCookies(res, session);

  res.status(200).json(user);
};

export const refreshUserSession = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;

  if (!sessionId || !refreshToken || !isValidObjectId(sessionId)) {
    throw createHttpError(401, 'Session not found');
  }

  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  if (session.refreshTokenValidUntil < new Date()) {
    await Session.findByIdAndDelete(session._id);
    clearSessionCookies(res);

    throw createHttpError(401, 'Session token expired');
  }

  await Session.findByIdAndDelete(session._id);
  const newSession = await createSession(session.userId);

  setSessionCookies(res, newSession);

  res.status(200).json({
    message: 'Session refreshed',
  });
};

export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;

  if (sessionId && isValidObjectId(sessionId)) {
    await Session.findByIdAndDelete(sessionId);
  }

  clearSessionCookies(res);

  res.status(204).send();
};

export const requestResetEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(200).json(passwordResetSuccessMessage);
    return;
  }

  const token = jwt.sign(
    {
      sub: user._id.toString(),
      email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',
    },
  );
  const templateSource = await fs.readFile(
    resetPasswordEmailTemplatePath,
    'utf8',
  );
  const template = handlebars.compile(templateSource);
  const resetLink = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${token}`;
  const html = template({
    username: user.username,
    resetLink,
  });

  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }

  res.status(200).json(passwordResetSuccessMessage);
};

export const resetPassword = async (req, res) => {
  const { password, token } = req.body;
  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Invalid or expired token');
  }

  if (
    typeof payload !== 'object' ||
    !payload ||
    !payload.sub ||
    !payload.email ||
    !isValidObjectId(payload.sub)
  ) {
    throw createHttpError(401, 'Invalid or expired token');
  }

  const user = await User.findOne({
    _id: payload.sub,
    email: payload.email,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  user.password = await bcrypt.hash(password, 10);
  await user.save();

  res.status(200).json({
    message: 'Password reset successfully',
  });
};
