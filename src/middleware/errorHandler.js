import { HttpError } from 'http-errors';
import multer from 'multer';

export const errorHandler = (error, req, res, _next) => {
  req.log?.error(error);

  if (error instanceof multer.MulterError) {
    res.status(400).json({
      message: error.message,
    });
    return;
  }

  const isHttpError = error instanceof HttpError;
  const status = isHttpError ? error.statusCode : 500;
  const message = isHttpError
    ? error.message || error.name
    : error.message || 'Internal Server Error';

  res.status(status).json({
    message,
  });
};
