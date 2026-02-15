// import { CountingBloomFilter } from "bloom-filters";
// import { promisify } from "util";
// import zlib from "zlib";
// import cache from "./cache";

// const BLOOM_FILTER_KEY = "bloomFilter";
// const n = 1000; // Expected number of items
// const p = 0.001; // Desired false positive rate (0.1%)
// const m = Math.ceil(-(n * Math.log(p)) / Math.log(2) ** 2); // Size in bits
// const k = Math.round((m / n) * Math.log(2)); // Number of hash functions

// const gzip = promisify(zlib.gzip);
// const gunzip = promisify(zlib.gunzip);

// // Function to load the Bloom Filter from disk
// export const loadBloomFilter = async (): Promise<CountingBloomFilter> => {
//   try {
//     const compressed = await cache.getBuffer(BLOOM_FILTER_KEY);
//     if (compressed) {
//       const jsonBuffer = await gunzip(compressed);
//       const json = jsonBuffer.toString();
//       return CountingBloomFilter.fromJSON(JSON.parse(json));
//     }
//     return new CountingBloomFilter(m, k);
//   } catch (error) {
//     console.error("==> Error loading Bloom Filter from Redis:", error);
//     return new CountingBloomFilter(m, k);
//   }
// };

// export const saveBloomFilter = async (bloomFilter: CountingBloomFilter) => {
//   try {
//     const json = JSON.stringify(bloomFilter.saveAsJSON());
//     const compressed = await gzip(json);
//     await cache.setBuffer(BLOOM_FILTER_KEY, compressed);
//   } catch (error) {
//     console.error("==> Error saving Bloom Filter to Redis:", error);
//   }
// };

// // Function to add an item (image hash) to the Bloom Filter
// export const addToBloomFilter = async (hash: string) => {
//   try {
//     const retryDelay = 100; // milliseconds
//     const maxRetries = 10;
//     let retries = 0;
//     let unlocked = false;

//     while (retries < maxRetries && !unlocked) {
//       unlocked = (await cache.setnx("bloomFilterLock", "locked", 5)) as boolean;
//       if (!unlocked) {
//         retries++;
//         await new Promise((resolve) => setTimeout(resolve, retryDelay));
//       }
//     }

//     if (!unlocked) {
//       throw new Error(
//         "Failed to acquire lock for Bloom Filter after maximum retries."
//       );
//     }
//     const bloomFilter = await loadBloomFilter();
//     bloomFilter.add(hash);
//     saveBloomFilter(bloomFilter);
//     cache.del("bloomFilterLock");
//   } catch (error) {
//     console.error("==> Error adding to Bloom Filter:", error);
//   }
// };

// export const removeFromBloomFilter = async (hash: string) => {
//   const bloomFilter = await loadBloomFilter();
//   bloomFilter.remove(hash);
//   saveBloomFilter(bloomFilter);
// };

// // Function to check if an item (image hash) exists in the Bloom Filter
// export const isInBloomFilter = async (hash: string): Promise<boolean> => {
//   const bloomFilter = await loadBloomFilter();
//   return bloomFilter.has(hash);
// };
