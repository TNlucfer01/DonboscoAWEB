// src/services/attendance.service.js
// ─── BARREL FILE ─────────────────────────────────────────────
// Re-exports all attendance functions from focused sub-services.
// This maintains backward compatibility with existing route imports.

const staffSvc = require('./attendance.staff.service');
const principalSvc = require('./attendance.principal.service');
const odilSvc = require('./attendance.odil.service');
const viewSvc = require('./attendance.view.service');

module.exports = {
    // Staff
    fetchStudents: staffSvc.fetchStudents,
    submit: staffSvc.submit,
    fetchStaffCorrectionStudents: staffSvc.fetchStaffCorrectionStudents,
    correctStaffSubmit: staffSvc.correctStaffSubmit,

    // Principal
    fetchStudentsPrincipal: principalSvc.fetchStudentsPrincipal,
    saveStudentPri: principalSvc.saveStudentPri,
    correct: principalSvc.correct,
    correctBulk: principalSvc.correctBulk,
    getBatch: principalSvc.getBatch,

    // YC OD/IL
    createODIL: odilSvc.createODIL,
    updateODIL: odilSvc.updateODIL,
    cancelODIL: odilSvc.cancelODIL,
    listODIL: odilSvc.listODIL,

    // View
    view: viewSvc.view,
};