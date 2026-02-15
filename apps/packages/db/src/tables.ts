export * from "./schemas/tables";

// Compatibility aliases (some parts of the codebase import pluralized names)
export { program as programs } from "./schemas/program";
export { home as homes } from "./schemas/home";
export { child as children } from "./schemas/child";
