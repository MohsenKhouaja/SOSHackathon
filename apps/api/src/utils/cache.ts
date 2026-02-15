// import { redis } from "../config/redis";

// const flushDb = () =>
//   new Promise((resolve, reject) => {
//     redis.flushdb((err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });

// const getBuffer = (key: string): Promise<Buffer | null | undefined> =>
//   new Promise((resolve, reject) => {
//     redis.getBuffer(key, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });

// const get = (key: string, expiry?: number) =>
//   new Promise<any | null>((resolve, reject) => {
//     if (expiry !== undefined) {
//       redis.getex(key, "EX", expiry, (err, result) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(result ? JSON.parse(result) : null);
//         }
//       });
//     } else {
//       redis.get(key, (err, result) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(result ? JSON.parse(result) : null);
//         }
//       });
//     }
//   });

// const getTyped = <T>(key: string, expiry?: number): Promise<T> =>
//   new Promise<T>((resolve, reject) => {
//     if (expiry !== undefined) {
//       redis.getex(key, "EX", expiry, (err, result) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(result ? JSON.parse(result) : null);
//         }
//       });
//     } else {
//       redis.get(key, (err, result) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(result ? JSON.parse(result) : null);
//         }
//       });
//     }
//   });

// const setBuffer = (key: string, value: Buffer) =>
//   new Promise((resolve, reject) => {
//     redis.setBuffer(key, value, "GET", (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result ? true : false);
//       }
//     });
//   });

// const set = (key: string, value: any, expiry?: number) =>
//   new Promise((resolve, reject) => {
//     redis.set(
//       key,
//       JSON.stringify(value),
//       "EX",
//       expiry ?? 43_200,
//       (err, result) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(result === "OK");
//         }
//       }
//     );
//   });

// const setWithNoExpiry = (key: string, value: any) =>
//   new Promise((resolve, reject) => {
//     redis.set(key, JSON.stringify(value), (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result === "OK");
//       }
//     });
//   });

// const setnx = (key: string, value: any, expiry = 43_200) => {
//   return new Promise((resolve, reject) => {
//     // First attempt to set the key with setnx
//     redis.setnx(key, JSON.stringify(value), (err, result) => {
//       if (err) {
//         reject(err);
//       } else if (result === 1) {
//         // If setnx succeeded, set the expiry
//         redis.expire(key, expiry, (errExpire, resultExpire) => {
//           if (errExpire) {
//             reject(errExpire);
//           } else {
//             resolve(resultExpire === 1);
//           }
//         });
//       } else {
//         // If setnx failed because the key exists
//         resolve(false);
//       }
//     });
//   });
// };

// const del = (key: string) =>
//   new Promise((resolve, reject) => {
//     redis.del(key, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result === 1);
//       }
//     });
//   });

// const keys = (pattern: string) =>
//   new Promise((resolve, reject) => {
//     redis.keys(pattern, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });

// const scan = (
//   cursor: string,
//   match: string,
//   count = 2000
// ): Promise<[string, string[]]> =>
//   new Promise((resolve, reject) => {
//     redis.scan(cursor, "MATCH", match, "COUNT", count, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result as [string, string[]]);
//       }
//     });
//   });

// const ttl = (key: string): Promise<number> =>
//   new Promise((resolve, reject) => {
//     redis.ttl(key, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result as number);
//       }
//     });
//   });

// const getList = (key: string): Promise<any[]> =>
//   new Promise((resolve, reject) => {
//     redis.lrange(key, 0, -1, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         const parsedResult = result?.map((item) => JSON.parse(item));
//         resolve(parsedResult && parsedResult.length > 0 ? parsedResult : []);
//       }
//     });
//   });

// const pushToList = (key: string, value: any, expiry?: number) =>
//   new Promise((resolve, reject) => {
//     redis.rpush(key, JSON.stringify(value), (err, result) => {
//       if (err) {
//         return reject(err);
//       }

//       if (expiry) {
//         redis.expire(key, expiry, (err, reply) => {
//           if (err) {
//             reject(err);
//           } else {
//             resolve(reply === 1);
//           }
//         });
//       } else {
//         resolve(result);
//       }
//     });
//   });

// const removeFromList = (key: string, value: any) =>
//   new Promise((resolve, reject) => {
//     const stringValue = JSON.stringify(value);

//     redis.lrem(key, 0, stringValue, (err, result) => {
//       if (err) {
//         return reject(err);
//       }
//       resolve(result);
//     });
//   });

// const getSet = (key: string): Promise<any[]> =>
//   new Promise((resolve, reject) => {
//     redis.smembers(key, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         const parsedResult = result?.map((item) => JSON.parse(item));
//         resolve(parsedResult && parsedResult.length > 0 ? parsedResult : []);
//       }
//     });
//   });

// const addToSet = (key: string, value: any, expiry?: number) =>
//   new Promise((resolve, reject) => {
//     redis.sadd(key, JSON.stringify(value), (err, result) => {
//       if (err) {
//         return reject(err);
//       }

//       if (expiry) {
//         redis.expire(key, expiry, (err, reply) => {
//           if (err) {
//             reject(err);
//           } else {
//             resolve(reply === 1);
//           }
//         });
//       } else {
//         resolve(result);
//       }
//     });
//   });

// const addManyToSet = (
//   key: string,
//   values: (string | number | Buffer)[],
//   expiry?: number
// ) =>
//   new Promise((resolve, reject) => {
//     redis.sadd(
//       key,
//       ...values.map((value) => JSON.stringify(value)),
//       (err, result) => {
//         if (err) {
//           return reject(err);
//         }

//         if (expiry) {
//           redis.expire(key, expiry, (err, reply) => {
//             if (err) {
//               reject(err);
//             } else {
//               resolve(reply === 1);
//             }
//           });
//         } else {
//           resolve(result);
//         }
//       }
//     );
//   });

// const removeFromSet = (key: string, value: any) =>
//   new Promise((resolve, reject) => {
//     const stringValue = JSON.stringify(value);

//     redis.srem(key, stringValue, (err, result) => {
//       if (err) {
//         return reject(err);
//       }
//       resolve(result);
//     });
//   });

// const getHashmap = (hashKey: string, field: string): Promise<any> =>
//   new Promise((resolve, reject) => {
//     redis.exists(hashKey, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result === 1);
//       }
//     });
//   });

// // Don't use this for now use getHashmap instead
// const getHashmapValue = (key: string, field: string): Promise<any> =>
//   new Promise((resolve, reject) => {
//     redis.hget(key, field, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });

// const getHashmapKeys = (key: string): Promise<string[] | undefined> =>
//   new Promise((resolve, reject) => {
//     redis.hkeys(key, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });

// const setHashmapValue = (
//   key: string,
//   field: string,
//   value: any
// ): Promise<any> =>
//   new Promise((resolve, reject) => {
//     redis.hset(key, field, value, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });

// const setMultipleFields = (
//   key: string,
//   fields: Record<string, any>
// ): Promise<any> =>
//   new Promise((resolve, reject) => {
//     const fieldValues = Object.entries(fields).flat();
//     redis.hmset(key, fieldValues, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });
// // write me a function that uses hdel to delete a field.
// const deleteHashmapField = (
//   key: string,
//   field: string
// ): Promise<number | undefined> =>
//   new Promise((resolve, reject) => {
//     redis.hdel(key, field, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });

// // delete multiple fields
// const deleteMultipleFields = (key: string, fields: string[]) =>
//   new Promise((resolve, reject) => {
//     redis.hdel(key, ...fields, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });

// export default {
//   flushDb,
//   get,
//   getBuffer,
//   getTyped,
//   setBuffer,
//   set,
//   setnx,
//   setWithNoExpiry,
//   del,
//   keys,
//   scan,
//   ttl,
//   getList,
//   pushToList,
//   removeFromList,
//   getSet,
//   addToSet,
//   addManyToSet,
//   removeFromSet,
//   getHashmap,
//   getHashmapValue,
//   setHashmapValue,
//   setMultipleFields,
//   deleteHashmapField,
//   deleteMultipleFields,
//   getHashmapKeys,
// };
