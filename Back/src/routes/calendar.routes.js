// src/routes/calendar.routes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuaurd');
const validate = require('../middleware/validate');
const { success } = require('../utils/apiResponse');
const calSvc = require('../services/calendar.service');

// All: Principal only
router.use(auth, roleGuard('PRINCIPAL'));

router.get('/', async (req, res, next) => {//working
    try { return success(res, await calSvc.getAll(req.query.year, req.query.month)); }
    catch (e) { next(e); }
});

router.post('/', //working  past date can't be updated
    [
        body('date').isDate().withMessage('date required (YYYY-MM-DD)'),
        body('day_type').isIn(['HOLIDAY', 'SATURDAY_ENABLED']).withMessage('day_type must be HOLIDAY or SATURDAY_ENABLED'),
    ],
    validate,
    async (req, res, next) => {
        try {
            return success(res, await calSvc.create({ ...req.body, declared_by: req.user.userId }), 201);
        } catch (e) { next(e); }
    }
);

router.put('/:id', async (req, res, next) => { //not used right now 
    try { return success(res, await calSvc.update(req.params.id, req.body)); }
    catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => { //used even now 
    try { return success(res, await calSvc.remove(req.params.id)); }
    catch (e) { next(e); }
});

module.exports = router;
