#!/usr/bin/env node
// PreToolUse hook for the fresh-eyes skill. While `.fresh-eyes/active` exists it
// denies tools that read the app's source, so the tester behaves like a first-time
// user. Best effort, not a sandbox: an interpreter one-liner can still read files.
// Matcher for settings.json: "Read|Grep|Glob|Bash".
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const MARKER = '.fresh-eyes/active';
const REPORT_DIR = '.fresh-eyes/';
const FILE_TOOLS = new Set(['Read', 'Grep', 'Glob']);
const READERS = /(^|[\s;&|`(])(cat|head|tail|less|more|bat|sed|awk|grep|egrep|rg|ag|find|tree|strings|xxd|od|nl|tac|cp|rsync)(\s|$)/;
const GIT_READS = /\bgit\s+(show|diff|log|grep|cat-file|ls-files|blame)\b/;

const REASON =
  'Fresh eyes run is active: you may only use the running app (browser, curl, the CLI) and write your report under .fresh-eyes/. Reading source is blocked.';

const allow = () => ({ action: 'allow' });
const deny = () => ({ action: 'deny', reason: REASON });

const touchesReportDir = (input) => {
  const target = input.file_path ?? input.path ?? '';
  return target.replace(/\\/g, '/').includes(REPORT_DIR);
};

export function decide({ active, toolName, toolInput = {} }) {
  if (!active) return allow();
  if (FILE_TOOLS.has(toolName)) return touchesReportDir(toolInput) ? allow() : deny();
  if (toolName === 'Bash') {
    const command = toolInput.command ?? '';
    return READERS.test(command) || GIT_READS.test(command) ? deny() : allow();
  }
  return allow();
}

function main() {
  let input = {};
  try {
    input = JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    return; // fail open on unreadable input
  }
  const cwd = input.cwd ?? process.cwd();
  const result = decide({
    active: existsSync(join(cwd, MARKER)),
    toolName: input.tool_name,
    toolInput: input.tool_input,
  });
  if (result.action === 'deny') {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: result.reason,
        },
      }),
    );
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
