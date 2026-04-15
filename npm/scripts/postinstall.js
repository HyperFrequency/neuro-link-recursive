#!/usr/bin/env node

"use strict";

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const BINARY_NAME = "neuro-link-mcp";
const nativeDir = path.join(__dirname, "..", "native");
const targetBin = path.join(nativeDir, "nlr");

// Already have the binary — nothing to do
if (fs.existsSync(targetBin)) {
  process.exit(0);
}

// Check if the binary is on PATH already
try {
  execSync(`which ${BINARY_NAME}`, { stdio: "pipe" });
  console.log(`${BINARY_NAME} found on PATH, skipping build.`);
  process.exit(0);
} catch {}

// Try to build from source
const serverDir = path.resolve(__dirname, "..", "..", "server");
const cargoToml = path.join(serverDir, "Cargo.toml");

if (!fs.existsSync(cargoToml)) {
  console.warn(
    "postinstall: Rust source not found. Binary must be provided or built manually.\n" +
      "  Run: cd server && cargo build --release"
  );
  process.exit(0); // non-fatal — the shim will error at runtime
}

console.log("postinstall: building neuro-link-mcp from source...");
try {
  execSync("cargo build --release", {
    cwd: serverDir,
    stdio: "inherit",
  });
} catch (err) {
  console.error("postinstall: cargo build failed:", err.message);
  process.exit(0); // non-fatal
}

const built = path.join(serverDir, "target", "release", BINARY_NAME);
if (!fs.existsSync(built)) {
  console.error("postinstall: expected binary not found after build.");
  process.exit(0);
}

// Copy binary to native/
fs.mkdirSync(nativeDir, { recursive: true });
fs.copyFileSync(built, targetBin);
fs.chmodSync(targetBin, 0o755);
console.log(`postinstall: installed ${BINARY_NAME} to npm/native/nlr`);
