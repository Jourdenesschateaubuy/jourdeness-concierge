import fs from "node:fs";

const file = "scripts/admin-v2-add-create-menu.mjs";

let source = fs.readFileSync(file, "utf8");
source = source.replace(/\r\n/g, "\n");

const from = `function replaceOnce(label, from, to) {
  if (!source.includes(from)) {`;

const to = `const eol = source.includes("\\r\\n") ? "\\r\\n" : "\\n";

function replaceOnce(label, from, to) {
  from = from.replace(/\\r?\\n/g, eol);
  to = to.replace(/\\r?\\n/g, eol);

  if (!source.includes(from)) {`;

if (!source.includes(from)) {
  throw new Error("Could not find replaceOnce function");
}

source = source.replace(from, to);

fs.writeFileSync(file, source, "utf8");

console.log("CRLF-safe patch applied");
