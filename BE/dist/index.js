"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const name = 'Project Based Learning 5';
console.log(`Welcome to ${name}`);
async function bootstrap() {
    const ok = await (0, db_1.testConnection)();
    if (!ok) {
        console.error('❌ Cannot connect to database, exiting...');
        process.exit(1);
    }
    app_1.default.listen(env_1.PORT, () => {
        console.log(`🚀 App is ready! Listening on http://localhost:${env_1.PORT}`);
    });
}
bootstrap().catch((err) => {
    console.error('❌ Unexpected error during bootstrap:', err);
    process.exit(1);
});
