export const errorHandler = (error, req, res, _next) => {
  req.log?.error(error);

  const status = error.status || error.statusCode || 500;

  res.status(status).json({
    message: error.message,
  });
};
