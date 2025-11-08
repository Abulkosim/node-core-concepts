import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

function runWorker(workerData) {
  try {
    const worker = new Worker('./worker.js', { workerData })

    worker.on('message', (message) => {
      console.log('Received message from worker:', message)
    })

    worker.on('error', (error) => {
      console.error('Worker error:', error)
    })

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker exited with code ${code}`)
      } else {
        console.log('Worker exited successfully')
      }
    })
  } catch (error) {
    console.error(error)
  }
}

runWorker('hello from main thread');