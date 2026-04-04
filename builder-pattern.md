# Builder pattern in JavaScript

The **Builder** pattern separates **how** a complex object is constructed from **what** it represents. You configure an object step by step (often with a fluent chain of methods), then call a final method—commonly `build()`—to produce the immutable or fully-validated result.

## When it helps

- Many optional fields or combinations; constructors with long parameter lists become hard to read and easy to misuse.
- You want a **readable, ordered API** (“set this, then that”) instead of one giant options object.
- You need **validation** or **defaults** applied only when building, not on every setter.
- You want to **reuse** the same construction steps for slightly different products (director + concrete builders in the classic Gang of Four form).

## Classic fluent builder (JavaScript)

```javascript
class HttpRequest {
  constructor({ method, url, headers, body, timeoutMs }) {
    this.method = method;
    this.url = url;
    this.headers = headers;
    this.body = body;
    this.timeoutMs = timeoutMs;
  }
}

class HttpRequestBuilder {
  constructor() {
    this._method = "GET";
    this._url = "";
    this._headers = {};
    this._body = null;
    this._timeoutMs = 30_000;
  }

  method(m) {
    this._method = m;
    return this;
  }

  url(u) {
    this._url = u;
    return this;
  }

  header(name, value) {
    this._headers[name] = value;
    return this;
  }

  jsonBody(data) {
    this._body = JSON.stringify(data);
    this.header("Content-Type", "application/json");
    return this;
  }

  timeoutMs(ms) {
    this._timeoutMs = ms;
    return this;
  }

  build() {
    if (!this._url) throw new Error("url is required");
    return new HttpRequest({
      method: this._method,
      url: this._url,
      headers: { ...this._headers },
      body: this._body,
      timeoutMs: this._timeoutMs,
    });
  }
}

// Usage
const req = new HttpRequestBuilder()
  .method("POST")
  .url("https://api.example.com/users")
  .header("Authorization", "Bearer token")
  .jsonBody({ name: "Ada" })
  .timeoutMs(10_000)
  .build();
```

Returning `this` from each setter enables **method chaining** (fluent interface).

## Builder vs. telescoping constructor

Without a builder, you often see:

```javascript
// Hard to remember argument order; many undefined placeholders
new Thing("a", undefined, undefined, 42, true);
```

With a builder, call sites read like prose and omit what they do not care about.

## Builder vs. a plain options object

An options object is fine for simple cases:

```javascript
createUser({ name, email, role = "user" });
```

A builder pays off when configuration is **multi-step**, **order-sensitive**, or when you want **methods that encode intent** (e.g. `jsonBody` sets body and content type together).

## Director (optional)

A **director** function encodes a fixed recipe that uses a builder interface, so different builders can produce different representations of the same logical steps:

```javascript
function buildLoginRequest(builder, credentials) {
  return builder
    .method("POST")
    .url("/auth/login")
    .jsonBody(credentials)
    .build();
}
```

## Summary

| Idea | Role |
|------|------|
| Product | The object you want (`HttpRequest`, `Query`, `Pizza`, …) |
| Builder | Mutable staging object with chainable methods |
| `build()` | Validates, applies defaults, returns the product |
| Director | Optional; orchestrates builders for standard workflows |

In JavaScript, builders are usually implemented as classes or factory functions that close over partial state; choose based on what matches the rest of your codebase.
