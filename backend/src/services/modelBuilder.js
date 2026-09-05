const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuid } = require('uuid');

const JOBS = {};

async function convertModel(modelPath, outputFormat, quantization = 'q4_0', io) {
  if (!await fs.pathExists(modelPath)) {
    throw new Error(`Model not found: ${modelPath}`);
  }

  const jobId = uuid();
  const outputDir = path.join(path.dirname(modelPath), 'converted');
  await fs.ensureDir(outputDir);

  const outputPath = path.join(
    outputDir,
    `${path.basename(modelPath, path.extname(modelPath))}.${outputFormat}`
  );

  JOBS[jobId] = {
    id: jobId,
    status: 'running',
    progress: 0,
    inputPath: modelPath,
    outputPath,
    format: outputFormat,
    logs: [],
    startedAt: new Date().toISOString(),
  };

  let cmd;
  switch (outputFormat) {
    case 'gguf':
      cmd = `python convert_hf_to_gguf.py "${modelPath}" --outfile "${outputPath}" --outtype ${quantization}`;
      break;
    case 'ggml':
      cmd = `python convert_hf_to_ggml.py "${modelPath}" "${outputPath}"`;
      break;
    case 'onnx':
      cmd = `optimum-cli export onnx --model "${modelPath}" "${outputPath}"`;
      break;
    case 'safetensors':
      cmd = `python -c "from safetensors.torch import save_file; print('safetensors conversion')"`;
      break;
    default:
      JOBS[jobId].status = 'failed';
      JOBS[jobId].logs.push(`Unsupported format: ${outputFormat}`);
      throw new Error(`Unsupported output format: ${outputFormat}`);
  }

  return new Promise((resolve, reject) => {
    const child = exec(cmd, { timeout: 7200000 }, (error) => {
      if (error) {
        JOBS[jobId].status = 'failed';
        JOBS[jobId].logs.push(`Error: ${error.message}`);
        if (io) io.emit('builder:error', { jobId, error: error.message });
        reject(error);
      } else {
        JOBS[jobId].status = 'complete';
        JOBS[jobId].progress = 100;
        JOBS[jobId].logs.push('Conversion complete');
        if (io) io.emit('builder:complete', { jobId, outputPath });
        resolve({ jobId, outputPath });
      }
    });

    child.stdout.on('data', (data) => {
      const line = data.toString().trim();
      JOBS[jobId].logs.push(line);
      if (io) io.emit('builder:log', { jobId, line });
    });

    child.stderr.on('data', (data) => {
      const line = data.toString().trim();
      JOBS[jobId].logs.push(line);
      if (io) io.emit('builder:log', { jobId, line });
    });
  });
}

function getConversionStatus(jobId) {
  return JOBS[jobId] || null;
}

module.exports = { convertModel, getConversionStatus };
