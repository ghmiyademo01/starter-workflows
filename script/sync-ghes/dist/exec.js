"use strict";

const { exec } = require("child_process");

/**
 * コマンドを実行する関数
 * @param {string} command 実行するシェルコマンド
 * @returns {Promise<void>}
 */
function runCommand(command) {
  return new Promise((resolve, reject) => {
    const child = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command failed: ${command}`);
        console.error(stderr);
        reject(error);
        return;
      }
      console.log(stdout);
      resolve();
    });

    child.on("error", (err) => {
      console.error(`Failed to start command: ${command}`);
      reject(err);
    });
  });
}

/**
 * GHESブランチに切り替える処理
 * SKIP_GIT=true の場合はスキップ
 */
async function switchToGhesBranch() {
  if (process.env.SKIP_GIT === "true") {
    console.log("Skipping git operations because SKIP_GIT=true");
    return;
  }

  try {
    console.log("Switch to GHES branch");
    //await runCommand("git checkout ghes");
  } catch (err) {
    console.error("Unhandled error while syncing workflows", err);
    process.exit(1);
  }
}

module.exports = {
  runCommand,
  switchToGhesBranch,
};
