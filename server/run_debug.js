const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, 'debug.log');
fs.writeFileSync(logFile, '');

const origLog = console.log.bind(console);
const origErr = console.error.bind(console);
console.log = (...args) => { fs.appendFileSync(logFile, args.join(' ') + '\n'); origLog(...args); };
console.error = (...args) => { fs.appendFileSync(logFile, '[ERR] ' + args.join(' ') + '\n'); origErr(...args); };

require('./index.js');
