const minimumMajor = 22;
const major = Number(process.versions.node.split(".")[0]);

if (!Number.isInteger(major) || major < minimumMajor) {
  console.error(`Node.js ${minimumMajor}+ is required. Current runtime is ${process.version}.`);
  process.exit(1);
}

console.log(`Runtime verification passed on Node.js ${process.version}.`);
