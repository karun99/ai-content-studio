const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const AGENT_REACH_PATH = process.env.AGENT_REACH_PATH || 'agent-reach';

async function runCollector(urls = [], platforms = [], options = {}) {
  const results = [];

  if (urls && urls.length > 0) {
    for (const url of urls) {
      try {
        const result = await runAgentReach(['--url', url], options);
        results.push({ url, ...result });
      } catch (err) {
        results.push({ url, error: err.message });
      }
    }
  }

  if (platforms && platforms.length > 0) {
    for (const platform of platforms) {
      try {
        const result = await runAgentReach(['--platform', platform], options);
        results.push({ platform, ...result });
      } catch (err) {
        results.push({ platform, error: err.message });
      }
    }
  }

  return results;
}

function runAgentReach(args, options, io) {
  return new Promise((resolve, reject) => {
    const cmd = `${AGENT_REACH_PATH} ${args.join(' ')} --output json`;
    const child = exec(cmd, { timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(error.message));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        resolve({ raw: stdout });
      }
    });

    if (io && child.stdout) {
      child.stdout.on('data', (data) => {
        io.emit('collector:log', data.toString());
      });
    }
  });
}

module.exports = { runCollector };
