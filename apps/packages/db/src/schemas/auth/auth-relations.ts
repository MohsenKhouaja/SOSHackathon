import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../tables";

export const authRelations = defineRelationsPart(schema, (_r) => ({
  // No auth relations defined yet for this project
}));
