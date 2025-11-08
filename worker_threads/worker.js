import {parentPort, workerData} from 'worker_threads'

console.log('worker received', workerData); 

function performCPUIntensiveTask() {
  let result = 0; 
  for (let i = 0; i < 1000000; i++) {
    result += i;
  } 
  return result;
}

const result = performCPUIntensiveTask()

parentPort.postMessage({
  receivedData: workerData, 
  calculatedSum: result
})