"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = exports.verifyToken = void 0;
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware function to verify JWT token
var verifyToken = function (req, res, next) {
    // Get the token from the request headers
    var token = req.headers['authorization'];
    // Check if token is present
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        // Verify the token
        var decoded = jsonwebtoken_1.default.verify(token, 'secret_key');
        // Attach user information to the request object
        req['user'] = decoded;
        // Proceed to the next middleware
        next();
    }
    catch (err) {
        return res.status(403).json({ error: 'Failed to authenticate token' });
    }
};
exports.verifyToken = verifyToken;
// Middleware function to authorize based on role
var authorizeRole = function (role) {
    return function (req, res, next) {
        var _a;
        // Check if user has the required role
        var userRole = (_a = req['user']) === null || _a === void 0 ? void 0 : _a.role;
        if (userRole !== role) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        // Proceed to the next middleware
        next();
    };
};
exports.authorizeRole = authorizeRole;
