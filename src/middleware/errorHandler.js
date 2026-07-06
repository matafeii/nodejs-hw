import createHttpError from 'http-errors';

const { isHttpError } = createHttpError;

export const errorHandler = (error, req, res, _next) => {
  req.log?.error(error);

  const status = isHttpError(error) ? error.statusCode : 500;

  res.status(status).json({
    message: error.message,
  });
};
