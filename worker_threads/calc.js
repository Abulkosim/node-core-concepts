import { workerData, parentPort } from "worker_threads";
import generatePrimes from "./prime-generator.js";

const primes = generatePrimes(workerData.count, workerData.start, {
  format: true,
});
parentPort.postMessage(primes);
