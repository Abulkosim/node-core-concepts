import { Worker } from 'node:worker_threads'

console.log('ok 1')
new Worker('./calc.js')
