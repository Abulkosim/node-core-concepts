function isPrime(n) {
  if (n <= 1) return false;
  if (n <= 3) return true;

  if (n % 2 === 0 || n % 3 === 0) return false;

  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

function isPrimeBigInt(n) {
  if (n <= 1n) return false;
  if (n <= 3n) return true;

  if (n % 2n === 0n || n % 3n === 0n) return false;

  for (let i = 5n; i * i <= n; i += 6n) {
    if (n % i === 0n || n % (i + 2n) === 0n) return false;
  }
  return true;
}

function nextPrime(n) {
  if (n <= 1) return 2;
  let prime = n;
  let found = false;

  while (!found) {
    prime++;
    if (isPrime(prime)) {
      found = true;
    }
  }
  return prime;
}

function nextPrimeBigInt(n) {
  if (n <= 1n) return 2n;
  let prime = n;
  let found = false;

  while (!found) {
    prime++;
    if (isPrimeBigInt(prime)) {
      found = true;
    }
  }
  return prime;
}

function formatNumberWithCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function generatePrimes(
  count,
  startingNumber = 0,
  options = { format: false, log: false }
) {
  const { format, log } = options;

  let nextP;

  if (typeof startingNumber === "bigint") {
    nextP = nextPrimeBigInt;
  } else {
    nextP = nextPrime;
  }

  let primes = [];

  let prime = nextP(startingNumber);
  primes.push(prime);

  for (let i = 1; i < count; i++) {
    prime = nextP(prime);
    if (log) console.log(format ? formatNumberWithCommas(prime) : prime);
    primes.push(prime);
  }

  if (!format) return primes;

  const formattedPrimes = primes.map(formatNumberWithCommas);
  return formattedPrimes;
}

