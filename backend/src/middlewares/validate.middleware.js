const { validateSchema } = require("../common/auth.schemas");
const { sendError, HTTP } = require("../common/shared");
const logger = require("../common/logger");

function validateRequest(schema) {
  return function validationMiddleware(req, res, next) {
    const CTX = "middleware.validateRequest";

    logger.debug(CTX, "Running Zod schema validation", {
      path: req.path,
      method: req.method,
    });

    const result = validateSchema(schema, req.body);

    if (!result.success) {
      logger.notice(CTX, "Request validation failed", {
        path: req.path,
        errors: result.errors,
        // Log the raw body fields (no passwords) for traceability
        receivedFields: Object.keys(req.body || {}),
      });

      return sendError(
        res,
        HTTP.BAD_REQUEST,
        "Validation failed. Please fix the errors and try again.",
        { errors: result.errors }
      );
    }

    // Attach Zod-parsed (trimmed, coerced, defaulted) data for the controller
    req.validatedBody = result.data;

    logger.debug(CTX, "Validation passed", {
      path: req.path,
      parsedFields: Object.keys(result.data),
    });

    next();
  };
}

module.exports = { validateRequest };