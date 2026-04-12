// class EmailNotifier {
//   send(message) {
//     console.log(`Email sent: ${message}`);
//     return { channel: 'email', message };
//   }
// }

// class LoggingDecorator {
//   constructor(notifier) {
//     this.notifier = notifier;
//   }

//   send(message) {
//     console.log(`[${new Date().toISOString()}] Sending notification...`);
//     const result = this.notifier.send(message);
//     console.log(`[${new Date().toISOString()}] Notification sent via ${result.channel}`);
//     return result;
//   }
// }

// class SlackDecorator {
//   constructor(notifier) {
//     this.notifier = notifier;
//   }

//   send(message) {
//     const result = this.notifier.send(message);
//     console.log(`Slack webhook fired: ${message}`);
//     return result;
//   }
// }

// class RetryDecorator {
//   constructor(notifier, maxRetries = 3) {
//     this.notifier = notifier;
//     this.maxRetries = maxRetries;
//   }

//   send(message) {
//     for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
//       try {
//         return this.notifier.send(message);
//       } catch (err) {
//         console.log(`Attempt ${attempt} failed, retrying...`);
//         if (attempt === this.maxRetries) throw err;
//       }
//     }
//   }
// }

// let notifier = new EmailNotifier();
// notifier = new LoggingDecorator(notifier);
// notifier = new RetryDecorator(notifier);
// notifier = new SlackDecorator(notifier);

// notifier.send('Server is on fire');

// the base — does one thing: makes requests
async function baseFetch(url, options = {}) {
  const res = await fetch(url, options);
  return res.json();
}

// decorator: adds timeout
function withTimeout(fetchFn, ms = 5000) {
  return async (url, options = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      return await fetchFn(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  };
}

// decorator: adds retry
function withRetry(fetchFn, maxRetries = 3) {
  return async (url, options = {}) => {
    for (let i = 1; i <= maxRetries; i++) {
      try {
        return await fetchFn(url, options);
      } catch (err) {
        if (i === maxRetries) throw err;
        await new Promise(r => setTimeout(r, 1000 * i)); // exponential-ish backoff
      }
    }
  };
}

// decorator: adds logging
function withLogging(fetchFn) {
  return async (url, options = {}) => {
    const start = Date.now();
    console.log(`→ ${options.method || 'GET'} ${url}`);
    try {
      const result = await fetchFn(url, options);
      console.log(`← ${url} (${Date.now() - start}ms)`);
      return result;
    } catch (err) {
      console.error(`✗ ${url} failed (${Date.now() - start}ms): ${err.message}`);
      throw err;
    }
  };
}