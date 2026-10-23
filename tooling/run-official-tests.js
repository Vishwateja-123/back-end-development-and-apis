import { readFile } from "fs/promises";
import { join } from "path";
import { ROOT } from "@freecodecamp/freecodecamp-os/.freeCodeCamp/tooling/env.js";
import * as __helpers from "./helpers.js";
import { assert, expect } from "chai";

async function parseProjectTests(dashedName) {
  const mdPath = join(ROOT, "curriculum", "locales", "english", `${dashedName}.md`);
  const content = await readFile(mdPath, "utf-8");

  // Extract beforeEach
  let beforeEachCode = "";
  const beforeEachMatch = content.match(/### --before-each--\s*```js\s*([\s\S]*?)```/);
  if (beforeEachMatch) {
    beforeEachCode = beforeEachMatch[1];
  }

  // Extract beforeAll
  let beforeAllCode = "";
  const beforeAllMatch = content.match(/### --before-all--\s*```js\s*([\s\S]*?)```/);
  if (beforeAllMatch) {
    beforeAllCode = beforeAllMatch[1];
  }

  // Extract tests section
  const testsSection = content.split("### --tests--")[1]?.split(/### --|## --fcc-end--/)[0];
  if (!testsSection) {
    throw new Error("Could not find ### --tests-- in " + mdPath);
  }

  const regex = /([^`\n][^\n]*)\s*```js\s*([\s\S]*?)```/g;
  const tests = [];
  let match;
  while ((match = regex.exec(testsSection)) !== null) {
    const title = match[1].trim();
    const code = match[2].trim();
    if (title && code) {
      tests.push({ title, code });
    }
  }

  return { beforeEachCode, beforeAllCode, tests };
}

async function runOfficialTests(dashedName) {
  console.log(`\n======================================================`);
  console.log(`🧪 Running Official Tests for: ${dashedName}`);
  console.log(`======================================================\n`);

  const project = { dashedName };
  const { beforeEachCode, beforeAllCode, tests } = await parseProjectTests(dashedName);

  if (beforeAllCode) {
    try {
      const fn = new Function("__helpers", "assert", "expect", "project", `return (async () => { ${beforeAllCode} })()`);
      await fn(__helpers, assert, expect, project);
    } catch (err) {
      console.error(`❌ beforeAll failed: ${err.message}`);
    }
  }

  let passed = 0;
  let failed = 0;
  const results = [];

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const testNum = i + 1;
    let __url = "http://localhost:3000/";
    
    try {
      if (beforeEachCode) {
        // Execute beforeEach in scope if needed
        eval(beforeEachCode);
      }

      // Prepare async test execution
      const testFn = new Function(
        "__helpers",
        "assert",
        "expect",
        "project",
        "__url",
        `return (async () => {
          ${beforeEachCode}
          ${test.code}
        })()`
      );

      await testFn(__helpers, assert, expect, project, __url);
      console.log(`  ✅ Test ${testNum}: ${test.title}`);
      passed++;
      results.push({ testNum, title: test.title, status: "PASSED" });
    } catch (err) {
      console.log(`  ❌ Test ${testNum}: ${test.title}`);
      console.log(`     Error: ${err.message || err}`);
      failed++;
      results.push({ testNum, title: test.title, status: "FAILED", error: err.message || String(err) });
    }
  }

  console.log(`\n------------------------------------------------------`);
  console.log(`Summary: ${passed}/${tests.length} passed (${failed} failed)`);
  console.log(`------------------------------------------------------\n`);
  return { passed, failed, total: tests.length, results };
}

const targetProject = process.argv[2] || "build-a-prime-number-checker-module";
runOfficialTests(targetProject).catch((err) => {
  console.error("Runner error:", err);
  process.exit(1);
});
