import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

const {port1, port2} = new MessageChannel();

const thread1 = new Worker('./worker_threads/child.js', {workerData: {port: port1}, transferList: [port1]})
const thread2 = new Worker('./worker_threads/child.js', {workerData: {port: port2}, transferList: [port2]})
