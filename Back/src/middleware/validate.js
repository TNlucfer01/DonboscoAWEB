const { validationResult } = require('express-validator');

// Runs after the express-validator body/query checks — if any validation
// errors were collected, returns a 400 with all error messages joined together
module.exports = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: errors.array().map(e => `${e.path}: ${e.msg}`).join('; '),
                details: errors.array(),
            },
        });
    }
    next();
};
