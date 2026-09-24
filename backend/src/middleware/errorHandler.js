const errorHandler = (err, req, res, next) => {
  // Log the error internally with Request ID for correlation
  console.error(`[REQ-ID: ${req.id || 'N/A'}] ERROR:`, err.stack);

  const statusCode = res.statusCode !== 200 ? res.statusCode : (err.statusCode || 500);
  
  // Production safe response
  const response = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: statusCode === 500 && process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : (err.message || 'Internal Server Error'),
      request_id: req.id
    }
  };

  // Only append stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = { errorHandler };
