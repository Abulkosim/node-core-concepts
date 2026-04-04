interface HttpRequestConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timeout: number;
  retries: number;
  followRedirects: boolean;
  proxy?: string;
}

class HttpRequestBuilder {
  private config: Partial<HttpRequestConfig> = {};

  constructor(url: string) {
    this.config.url = url;
  }

  method(method: string): this {
    this.config.method = method;
    return this;
  }

  header(key: string, value: string): this {
    if (!this.config.headers) this.config.headers = {};
    this.config.headers[key] = value;
    return this;
  }

  body(body: string): this {
    this.config.body = body;
    return this;
  }

  timeout(ms: number): this {
    this.config.timeout = ms;
    return this;
  }

  retries(count: number): this {
    this.config.retries = count;
    return this;
  }

  followRedirects(follow: boolean): this {
    this.config.followRedirects = follow;
    return this;
  }

  proxy(url: string): this {
    this.config.proxy = url;
    return this;
  }

  build(): HttpRequestConfig {
    if (!this.config.url) throw new Error('URL is required');

    return {
      url: this.config.url,
      method: this.config.method ?? 'GET',
      headers: this.config.headers ?? {},
      body: this.config.body,
      timeout: this.config.timeout ?? 5000,
      retries: this.config.retries ?? 0,
      followRedirects: this.config.followRedirects ?? true,
      proxy: this.config.proxy,
    };
  }
}

const healthCheck = new HttpRequestBuilder('https://api.example.com/health')
  .timeout(3000)
  .retries(3)
  .build();

const webhook = new HttpRequestBuilder('https://hooks.slack.com/xxx')
  .method('POST')
  .header('Content-Type', 'application/json')
  .header('X-Request-Id', crypto.randomUUID())
  .body(JSON.stringify({ text: 'Job failed' }))
  .timeout(10000)
  .retries(2)
  .followRedirects(false)
  .build();