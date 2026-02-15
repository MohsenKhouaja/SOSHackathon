import { db } from "@repo/db";

console.log("Schema keys:", Object.keys((db as any)._?.schema || {}));
console.log("Has locations?", "locations" in ((db as any)._?.schema || {}));
