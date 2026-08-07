exports.notFound = (req, res) => res.status(404).json({ message: `Route ${req.originalUrl} was not found.` });
exports.errorHandler = (err, req, res, next) => {
  console.error(err);
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.code === 11000) return res.status(409).json({ message: 'That value already exists.' });
  res.status(err.statusCode || 500).json({ message: err.message || 'Something went wrong.' });
};
