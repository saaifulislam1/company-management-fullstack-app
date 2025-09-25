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
exports.updateStatusController = exports.getAllRequestsController = exports.getHistoryController = exports.applyLeaveController = void 0;
const asyncHandler_1 = require("@/utils/asyncHandler");
const apiResponse_1 = require("@/utils/apiResponse");
const leaveService = __importStar(require("../services/leave.service"));
exports.applyLeaveController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const leave = await leaveService.applyForLeave(req.employee.id, req.body);
    res
        .status(201)
        .json(new apiResponse_1.ApiResponse(201, leave, 'Leave request submitted'));
});
exports.getHistoryController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const history = await leaveService.getLeaveHistory(req.employee.id);
    res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, history, 'Leave history fetched'));
});
exports.getAllRequestsController = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const requests = await leaveService.getAllLeaveRequests();
    res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, requests, 'All leave requests fetched'));
});
exports.updateStatusController = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { leaveId } = req.params;
    const { status } = req.body;
    const updatedRequest = await leaveService.updateLeaveStatus(leaveId, status);
    res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, updatedRequest, 'Leave status updated'));
});
