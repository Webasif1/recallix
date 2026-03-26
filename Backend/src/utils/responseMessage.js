export function responseMessage(
  res,
  { status = 200, message = "", success = true, error = null, data = null },
) {
  return res.status(status).json({
    message,
    success,
    error,
    data,
  });
}
