"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bcrypt_1 = __importDefault(require("bcrypt"));
var saltRounds = 10; // Number of salt rounds for hashing
// Hash a password
var password = 'abc123';
bcrypt_1.default.hash(password, saltRounds, function (err, hash) {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log('Hashed password:', hash);
});
