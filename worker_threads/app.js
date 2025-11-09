import { Worker } from "worker_threads";
import { performance } from "perf_hooks";

let result = [];
const THREADS = 4;
let completed = 0;
const count = 100; 
const start = performance.now();

for (let i = 0; i < THREADS; i++) {
  const worker = new Worker("./worker_threads/calc.js", {
    workerData: {
      count: count / THREADS,
      start: 100_000_000_000_000 + i * 300,
    },
  });
  const threadId = worker.threadId;
  console.log(`Worker ${threadId} started.`);

  worker.on("message", (primes) => {
    result = result.concat(primes);
  });

  worker.on("error", (err) => {
    console.error(err);
  });

  worker.on("exit", (code) => {
    console.log(`Worker ${threadId} exited.`);

    completed++;

    if (completed === THREADS) {
      console.log(`Time Taken: ${performance.now() - start}ms`);
      console.log(result.sort());
    }

    if (code !== 0) {
      console.error(`Worker ${threadId} exited with code ${code}`);
    }
  });
}
