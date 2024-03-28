// A quick tool to generate the table of contents in the README
// Usage: 'esrun make-table-of-contents.ts'

import { exec as oldExec } from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(oldExec);
const log = console.log.bind(console);

// Get all the headings from the README
const command = `git grep -h '^### ' README.md`;
// @ts-ignore - not adding "type": "module" to package.json as it breaks imports
// in the rest of the code.
const { stdout } = await exec(command);

const headings = stdout.split("\n");

const headingToLink = (markdownHeading: string) => {
  // A markdown heading like:
  //   ### Get the logs for a transaction
  // becomes a link like:
  //   #get-the-logs-for-a-transaction

  const heading = markdownHeading.slice(4);

  // replace all the spaces with a dash
  // and remove any commas
  const link = heading.toLowerCase().replaceAll(/ /g, "-").replaceAll(/,/g, "");

  return `[${heading}](#${link})`;
};

const links = headings.map((heading) => {
  return headingToLink(heading);
});

log(links.join("\n\n"));
