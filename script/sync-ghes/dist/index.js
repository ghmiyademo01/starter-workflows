#!/usr/bin/env npx ts-node
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
const fs_1 = require("fs");
const js_yaml_1 = require("js-yaml");
const path_1 = require("path");
const exec_1 = require("./exec");
function checkWorkflows(folders, enabledActions, partners) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = {
            compatibleWorkflows: [],
            incompatibleWorkflows: [],
        };
        const partnersSet = new Set(partners.map((x) => x.toLowerCase()));
        for (const folder of folders) {
            const dir = yield fs_1.promises.readdir(folder, {
                withFileTypes: true,
            });
            for (const e of dir) {
                if (e.isFile() && path_1.extname(e.name) === ".yml") {
                    const workflowFilePath = path_1.join(folder, e.name);
                    const workflowId = path_1.basename(e.name, path_1.extname(e.name));
                    const workflowProperties = require(path_1.join(folder, "properties", `${workflowId}.properties.json`));
                    const iconName = workflowProperties["iconName"];
                    const isPartnerWorkflow = workflowProperties.creator ? partnersSet.has(workflowProperties.creator.toLowerCase()) : false;
                    const enabled = !isPartnerWorkflow &&
                        (workflowProperties.enterprise === true || path_1.basename(folder) !== 'code-scanning') &&
                        (yield checkWorkflow(workflowFilePath, enabledActions));
                    const workflowDesc = {
                        folder,
                        id: workflowId,
                        iconName,
                        iconType: iconName && iconName.startsWith("octicon") ? "octicon" : "svg",
                    };
                    if (!enabled) {
                        result.incompatibleWorkflows.push(workflowDesc);
                    }
                    else {
                        result.compatibleWorkflows.push(workflowDesc);
                    }
                }
            }
        }
        return result;
    });
}
/**
 * Check if a workflow uses only the given set of actions.
 *
 * @param workflowPath Path to workflow yaml file
 * @param enabledActions List of enabled actions
 */
function checkWorkflow(workflowPath, enabledActions) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create set with lowercase action names for easier, case-insensitive lookup
        const enabledActionsSet = new Set(enabledActions.map((x) => x.toLowerCase()));
        try {
            const workflowFileContent = yield fs_1.promises.readFile(workflowPath, "utf8");
            const workflow = js_yaml_1.safeLoad(workflowFileContent);
            for (const job of Object.keys(workflow.jobs || {}).map((k) => workflow.jobs[k])) {
                for (const step of job.steps || []) {
                    if (!!step.uses) {
                        // Check if allowed action
                        const [actionName, _] = step.uses.split("@");
                        const actionNwo = actionName.split("/").slice(0, 2).join("/");
                        if (!enabledActionsSet.has(actionNwo.toLowerCase())) {
                            console.info(`Workflow ${workflowPath} uses '${actionName}' which is not supported for GHES.`);
                            return false;
                        }
                    }
                }
            }
            // All used actions are enabled 🎉
            return true;
        }
        catch (e) {
            console.error("Error while checking workflow", e);
            throw e;
        }
    });
}
(function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const settings = require("./settings.json");
            const result = yield checkWorkflows(settings.folders, settings.enabledActions, settings.partners);
            console.group(`Found ${result.compatibleWorkflows.length} starter workflows compatible with GHES:`);
            console.log(result.compatibleWorkflows.map((x) => `${x.folder}/${x.id}`).join("\n"));
            console.groupEnd();
            console.group(`Ignored ${result.incompatibleWorkflows.length} starter-workflows incompatible with GHES:`);
            console.log(result.incompatibleWorkflows.map((x) => `${x.folder}/${x.id}`).join("\n"));
            console.groupEnd();
            console.log("Switch to GHES branch");
            yield exec_1.exec("git", ["checkout", "ghes"]);
            // In order to sync from main, we might need to remove some workflows, add some
            // and modify others. The lazy approach is to delete all workflows first (except from read-only folders), and then
            // just bring the compatible ones over from the main branch. We let git figure out
            // whether it's a deletion, add, or modify and commit the new state.
            console.log("Remove all workflows");
            yield exec_1.exec("rm", ["-fr", ...settings.folders]);
            yield exec_1.exec("rm", ["-fr", "../../icons"]);
            // Bring back the read-only folders
            console.log("Restore read-only folders");
            for (let i = 0; i < settings.readOnlyFolders.length; i++) {
                yield exec_1.exec("git", [
                    "checkout",
                    settings.readOnlyFolders[i]
                ]);
            }
            console.log("Sync changes from main for compatible workflows");
            yield exec_1.exec("git", [
                "checkout",
                "main",
                "--",
                ...Array.prototype.concat.apply([], result.compatibleWorkflows.map((x) => {
                    const r = [];
                    // Don't touch read-only folders
                    if (!settings.readOnlyFolders.includes(x.folder)) {
                        r.push(path_1.join(x.folder, `${x.id}.yml`));
                        r.push(path_1.join(x.folder, "properties", `${x.id}.properties.json`));
                    }
                    ;
                    if (x.iconType === "svg") {
                        r.push(path_1.join("../../icons", `${x.iconName}.svg`));
                    }
                    return r;
                })),
            ]);
            // The v4 versions of upload and download artifact are not yet supported on GHES
            console.group("Updating all compatible workflows to use v3 of the artifact actions");
            for (const workflow of result.compatibleWorkflows) {
                const path = path_1.join(workflow.folder, `${workflow.id}.yml`);
                console.log(`Updating ${path}`);
                const contents = yield fs_1.promises.readFile(path, "utf8");
                if (contents.includes("actions/upload-artifact@v4") || contents.includes("actions/download-artifact@v4")) {
                    console.log("Found v4 artifact actions, updating to v3");
                }
                else {
                    continue;
                }
                let updatedContents = contents.replace(/actions\/upload-artifact@v4/g, "actions/upload-artifact@v3");
                updatedContents = updatedContents.replace(/actions\/download-artifact@v4/g, "actions/download-artifact@v3");
                yield fs_1.promises.writeFile(path, updatedContents);
            }
            console.groupEnd();
        }
        catch (e) {
            console.error("Unhandled error while syncing workflows", e);
            process.exitCode = 1;
        }
    });
})();
