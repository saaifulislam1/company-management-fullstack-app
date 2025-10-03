"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const attendance_controller_1 = require("./attendance.controller");
const router = (0, express_1.Router)();
// All attendance routes require the user to be logged in
router.use(auth_1.protect);
router.post('/check-in', attendance_controller_1.checkInController);
router.patch('/check-out', attendance_controller_1.checkOutController);
router.get('/history', attendance_controller_1.getHistoryController);
exports.default = router;
