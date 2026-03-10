// src/routes/user.routes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuaurd');
const validate = require('../middleware/validate');
const makeController = require('../controllers/crud.controller');
const userService = require('../services/user.service');

const ctrl = makeController(userService);

const userValidation = [ //if possible add other detials in the future 
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone_number').isMobilePhone().withMessage('Valid phone number is required'),
    body('role').isIn(['YEAR_COORDINATOR', 'SUBJECT_STAFF']).withMessage('Role must be YEAR_COORDINATOR or SUBJECT_STAFF'),
];

// All user routes — Principal only
router.use(auth, roleGuard('PRINCIPAL'));

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', userValidation, validate, ctrl.create);
router.put('/:id', userValidation, validate, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
