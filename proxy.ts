// class DatabaseService {
//   query(sql) {
//     console.log(`Executing: ${sql}`);
//     return [{ id: 1, name: 'record' }];
//   }
// }

// class DatabaseProxy {
//   constructor(db, user) {
//     this.db = db;
//     this.user = user;
//   }

//   query(sql) {
//     if (sql.trim().toUpperCase().startsWith('DROP') && this.user.role !== 'admin') {
//       throw new Error(`User "${this.user.name}" is not allowed to execute DROP statements`);
//     }
//     return this.db.query(sql);
//   }
// }

// const db = new DatabaseService();
// const proxy = new DatabaseProxy(db, { name: 'junior_dev', role: 'developer' });

// proxy.query('SELECT * FROM users');   
// proxy.query('DROP TABLE users');     

// function createLoggingProxy(service, serviceName) {
//   return new Proxy(service, {
//     get(target, prop) {
//       const original = target[prop];
//       if (typeof original !== 'function') return original;

//       return function (...args) {
//         const start = performance.now();
//         console.log(`[${serviceName}] ${prop}() called`);

//         try {
//           const result = original.apply(target, args);

//           if (result instanceof Promise) {
//             return result.then(res => {
//               console.log(`[${serviceName}] ${prop}() resolved in ${(performance.now() - start).toFixed(1)}ms`);
//               return res;
//             });
//           }

//           console.log(`[${serviceName}] ${prop}() returned in ${(performance.now() - start).toFixed(1)}ms`);
//           return result;
//         } catch (err) {
//           console.error(`[${serviceName}] ${prop}() threw: ${err.message}`);
//           throw err;
//         }
//       };
//     }
//   });
// }

// const userService = createLoggingProxy(new UserService(), 'UserService');
// userService.findById(42); 

function createCachingProxy(service, ttlMs = 60_000) {
  const cache = new Map();

  return new Proxy(service, {
    get(target, prop) {
      const original = target[prop];
      if (typeof original !== 'function') return original;

      return async function (...args) {
        const key = `${prop}:${JSON.stringify(args)}`;
        const cached = cache.get(key);

        if (cached && Date.now() - cached.timestamp < ttlMs) {
          return cached.value;
        }

        const result = await original.apply(target, args);
        cache.set(key, { value: result, timestamp: Date.now() });
        return result;
      };
    }
  });
}

const api = createCachingProxy(new WeatherApiClient(), 5 * 60_000);
await api.getForecast('Tashkent'); 
await api.getForecast('Tashkent'); 