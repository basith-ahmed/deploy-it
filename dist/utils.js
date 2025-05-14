"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate_id = generate_id;
const MAX_LEN = 5;
function generate_id() {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < MAX_LEN; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
