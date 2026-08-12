const { validationResult } = require('express-validator');

/** Runs after express-validator check(...) chains; short-circuits with 400 on failure */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(', ');
    throw new Error(message);
  }
  next();
};

module.exports = validate;
