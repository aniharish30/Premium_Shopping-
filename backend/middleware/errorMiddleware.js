const notFound = (req, res, next) => {
  const err = new Error(`Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(err);
};

const errorHandler = (err, req, res, next) => {
  let status  = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Server Error";

  if (err.name === "CastError")        { status = 404; message = "Item not found"; }
  if (err.code === 11000)              { status = 400; message = `${Object.keys(err.keyValue)[0]} already exists`; }
  if (err.name === "ValidationError")  { status = 400; message = Object.values(err.errors).map(e => e.message).join(", "); }
  if (err.name === "JsonWebTokenError"){ status = 401; message = "Invalid token — please log in again"; }
  if (err.name === "TokenExpiredError"){ status = 401; message = "Session expired — please log in again"; }

  console.error(`[${status}] ${req.method} ${req.path} — ${message}`);
  res.status(status).json({ success: false, message });
};

module.exports = { notFound, errorHandler };
