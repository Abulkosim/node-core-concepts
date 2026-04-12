class ApiClient {
  async fetch(endpoint) {
    console.log(`Fetching ${endpoint}`);
    return { data: `Response from ${endpoint}` };
  }
}

class RateLimitedProxy {
  constructor(client, { maxCalls, windowMs }) {
    this.client = client;
    this.maxCalls = maxCalls;
    this.windowMs = windowMs;
    this.calls = [];
  }

  async fetch(endpoint) {
    const now = Date.now();

    this.calls = this.calls.filter(timestamp => now - timestamp < this.windowMs);

    if (this.calls.length >= this.maxCalls) {
      throw new Error('Rate limit exceeded');
    }

    this.calls.push(now);
    return this.client.fetch(endpoint);
  }
}

const client = new RateLimitedProxy(new ApiClient(), { maxCalls: 3, windowMs: 10_000 });

await client.fetch('/users');    // works
await client.fetch('/orders');   // works
await client.fetch('/items');    // works
await client.fetch('/stats');    // throws "Rate limit exceeded"