import generatePrimes from "./prime-generator.js";
import { performance } from "perf_hooks";

const start = performance.now();

console.log(generatePrimes(10, 100_000_000_000_000_000n));

console.log(`Time Taken: ${performance.now() - start}ms`);
