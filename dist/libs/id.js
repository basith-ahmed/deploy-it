"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate_id = void 0;
const MAX_LEN = 5;
const generate_id = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < MAX_LEN; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
exports.generate_id = generate_id;
