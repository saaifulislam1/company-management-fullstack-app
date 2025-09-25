"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const role_1 = require("@/middleware/role");
const validate_1 = require("@/middleware/validate");
const validator = __importStar(require("../validators/leave.validator"));
const controller = __importStar(require("../controllers/leave.controller"));
const router = (0, express_1.Router)();
// All leave routes are protected
router.use(auth_1.protect);
// Employee routes
router.post('/apply', (0, validate_1.validate)(validator.applyLeaveSchema), controller.applyLeaveController);
router.get('/history', controller.getHistoryController);
// Admin/HR routes
router.get('/requests', (0, role_1.authorize)('ADMIN', 'HR'), controller.getAllRequestsController);
router.patch('/requests/:leaveId', (0, role_1.authorize)('ADMIN', 'HR'), (0, validate_1.validate)(validator.updateLeaveStatusSchema), controller.updateStatusController);
exports.default = router;
