import { parentPort } from 'worker_threads';

parentPort.on('message', (message) => {
  console.log('Worker received:', message);
  
  if (typeof message === 'object' && message.type === 'task') {
    const result = processTask(message.data);
    parentPort.postMessage({ type: 'result', data: result });
  } else {
    parentPort.postMessage(`Worker echoing: ${message}`);
  }
});

function processTask(data) {
  if (Array.isArray(data)) {
    return data.map(x => x * 2);
  }
  return null;
}