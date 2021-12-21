import fs from 'fs-extra';

/** Uncaught errors are SWALLOWED. Prevent this. */
export const onUncaught = (err: any) => {
  console.log(err);
  process.exit(1);
};

process.on('uncaughtException', onUncaught);
process.on('unhandledRejection', onUncaught);

export const sandboxRoot = 'sandbox';

export function resetSandbox() {
  fs.ensureDirSync(sandboxRoot);
  try {
    fs.emptyDirSync(sandboxRoot);
  } catch (err) {
    console.log(err);
  }
}
