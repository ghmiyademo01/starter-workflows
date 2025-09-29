"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exec = exports.ExecResult = void 0;
const child_process_1 = require("child_process");
class ExecResult {
    constructor() {
        this.stdout = "";
        this.exitCode = 0;
    }
}
exports.ExecResult = ExecResult;
/**
 * Executes a process
 */
function exec(command, args = [], allowAllExitCodes = false) {
    return __awaiter(this, void 0, void 0, function* () {
        process.stdout.write(`EXEC: ${command} ${args.join(" ")}\n`);
        return new Promise((resolve, reject) => {
            const execResult = new ExecResult();
            const cp = child_process_1.spawn(command, args, {});
            // STDOUT
            cp.stdout.on("data", (data) => {
                process.stdout.write(data);
                execResult.stdout += data.toString();
            });
            // STDERR
            cp.stderr.on("data", (data) => {
                process.stderr.write(data);
            });
            // Close
            cp.on("close", (code) => {
                execResult.exitCode = code;
                if (code === 0 || allowAllExitCodes) {
                    resolve(execResult);
                }
                else {
                    reject(new Error(`Command exited with code ${code}`));
                }
            });
        });
    });
}
exports.exec = exec;
