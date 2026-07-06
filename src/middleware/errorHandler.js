import createHttpError from 'http-errors';

const { HttpError } = createHttpError;

export const errorHandler = (error, req, res, _next) => {
  req.log?.error(error);

  const isHttpError = error instanceof HttpError;
  const status = isHttpError ? error.statusCode : 500;
  const message = isHttpError
    ? error.message || error.name
    : error.message || 'Internal Server Error';

  res.status(status).json({
    message,
  });
};
