class ApiError extends Error {
  constructor(status, message, data) {
    super();

    this.status = status;
    this.message = message;
    this.data = data;
  }

  static badRequest(message, data) {
    return new ApiError(404, message, data);
  }

  static internal(message, data) {
    return new ApiError(500, message, data);
  }

  static forbidden(message, data) {
    return new ApiError(403, message, data);
  }
}

module.exports = ApiError;
