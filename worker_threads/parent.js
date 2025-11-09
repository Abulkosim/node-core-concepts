import { Worker } from 'worker_threads';

const worker = new Worker('./worker_threads/child.js');

worker.postMessage('Message from parent');
worker.postMessage({ type: 'task', data: [1, 2, 3, 4, 5] });

worker.on('message', (message) => {
  console.log('Received message from worker:', message)
})

worker.on('error', (error) => {
  console.error('Worker error:', error)
})

worker.on('exit', (code) => {
  console.log('Worker exited with code:', code)
})