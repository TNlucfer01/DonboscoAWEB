// src/controllers/crud.controller.js
// Generic factory for simple CRUD controllers — reduces boilerplate
const { success } = require('../utils/apiResponse');
// Generic factory — given a service with getAll/getById/create/update/remove,
// returns Express route handlers that delegate to those methods
const makeController = (service) => ({
    getAll: async (req, res, next) => {
        try { return success(res, await service.getAll(req.query, req.user)); }
        catch (e) { next(e); }
    },
    getById: async (req, res, next) => {
        try { return success(res, await service.getById(req.params.id)); }
        catch (e) { next(e); }
    },
    create: async (req, res, next) => {
        try { return success(res, await service.create(req.body), 201); }
        catch (e) { next(e); }
    },
    update: async (req, res, next) => {
        try { return success(res, await service.update(req.params.id, req.body)); }
        catch (e) { next(e); }
    },
    remove: async (req, res, next) => {
        try { return success(res, await service.remove(req.params.id)); }
        catch (e) { next(e); }
    },
});

module.exports = makeController;
