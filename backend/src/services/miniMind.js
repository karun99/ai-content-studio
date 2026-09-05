const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

const MINIMIND_PATH = process.env.MINIMIND_PATH || '/opt/minimind';
let trainingState = {
  running: false,
  progress: 0,
  epoch: 0,
  loss: 0,
  logs: [],
};

async function startTraining(config, io) {
  if (trainingState.running) {
    throw new Error('Training already in progress');
  }

  const {
    dataset = 'default',
    epochs = 10,
    lr = 5e-4,
    batchSize = 32,
    modelSize = '256',
  } = config || {};

  trainingState = { running: true, progress: 0, epoch: 0, loss: 0, logs: [] };

  const cmd = [
    `cd ${MINIMIND_PATH}`,
    `python train.py`,
    `--model_size ${modelSize}`,
    `--epochs ${epochs}`,
    `--lr ${lr}`,
    `--batch_size ${batchSize}`,
    `--dataset ${dataset}`,
  ].join(' ');

  return new Promise((resolve, reject) => {
    const child = exec(cmd, { timeout: 7200000 }, (error) => {
      trainingState.running = false;
      if (error) {
        trainingState.logs.push(`Error: ${error.message}`);
        if (io) io.emit('training:error', { error: error.message });
        reject(error);
      } else {
        trainingState.progress = 100;
        trainingState.logs.push('Training complete');
        if (io) io.emit('training:complete', trainingState);
        resolve({ success: true, state: trainingState });
      }
    });

    child.stdout.on('data', (data) => {
      const line = data.toString().trim();
      trainingState.logs.push(line);
      if (io) io.emit('training:log', { line });

      const epochMatch = line.match(/Epoch (\d+)/);
      if (epochMatch) trainingState.epoch = parseInt(epochMatch[1]);

      const lossMatch = line.match(/loss[:\s]+([0-9.]+)/i);
      if (lossMatch) trainingState.loss = parseFloat(lossMatch[1]);

      if (epochs > 0) {
        trainingState.progress = Math.round((trainingState.epoch / epochs) * 100);
        if (io) io.emit('training:progress', { progress: trainingState.progress });
      }
    });

    child.stderr.on('data', (data) => {
      const line = data.toString().trim();
      trainingState.logs.push(line);
      if (io) io.emit('training:log', { line });
    });
  });
}

function getTrainingStatus() {
  return trainingState;
}

module.exports = { startTraining, getTrainingStatus };
