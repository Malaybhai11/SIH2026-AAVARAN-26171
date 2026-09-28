import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const logFile = path.resolve('server/audit/requests.jsonl');

if (!fs.existsSync(logFile)) {
  fs.writeFileSync(logFile, '');
}

console.log(`Watching ${logFile} for audit requests...\n`);

let fileSize = fs.statSync(logFile).size;

function readNewLines() {
  const newSize = fs.statSync(logFile).size;
  if (newSize < fileSize) {
    fileSize = 0; // Rotated
  }
  if (newSize === fileSize) return;

  const stream = fs.createReadStream(logFile, { start: fileSize, end: newSize });
  fileSize = newSize;

  const rl = readline.createInterface({ input: stream });
  rl.on('line', (line) => {
    if (!line.trim()) return;
    try {
      const data = JSON.parse(line);
      console.log('----------------------------------------------------');
      console.log(`[TIMESTAMP] ${data._receivedAt ? new Date(data._receivedAt * 1000).toLocaleString() : 'N/A'}`);
      console.log(`[PROMPT]    ${data.prompt || '(empty)'}`);
      if (data.redactionScheme || data.sanitizedDom) {
        console.log(`[TOKENS]    ${JSON.stringify(data.redactionScheme || data.sanitizedDom, null, 2)}`);
      }
    } catch (e) {
      console.log(line);
    }
  });
}

fs.watchFile(logFile, { interval: 500 }, readNewLines);
readNewLines();
