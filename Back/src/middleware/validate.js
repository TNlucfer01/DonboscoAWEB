const { validationResult } = require('express-validator');

// Run after express-validator chain — collects errors and returns 400 if any
//what does this validate  ooh i still don't understand at all 
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
