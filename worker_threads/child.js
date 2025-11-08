import { parentPort, workerData } from 'worker_threads';

console.log('child received', workerData);

const port = workerData.port;

port.on('message', (message) => {
  console.log('Received message from parent:', message)
})

port.postMessage('Hello from child')