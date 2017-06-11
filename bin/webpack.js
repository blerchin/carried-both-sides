#!/usr/bin/env node

'use strict';

// Standard lib.
const childProcess = require('child_process');
const path = require('path');

// Configure.
const config = path.resolve(__dirname, '../webpack.config.js');
const argv = [ '--config', config, ...process.argv.slice(2) ];

// Run.
childProcess.spawn('webpack', argv, {
  cwd: process.cwd(), //  Current working directory of the child process.
  stdio: 'inherit' // process.stdin, process.stdout, process.stderr.
});
