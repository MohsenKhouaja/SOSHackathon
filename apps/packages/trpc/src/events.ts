import { EventEmitter } from "node:events";

// Define event types
export const EventType = {
  CHAT_MESSAGE: "chat:message",
  RESOURCE_UPDATED: "resource:updated",
  RESOURCE_CREATED: "resource:created",
  RESOURCE_DELETED: "resource:deleted",
  NOTIFICATION: "notification",
};

// Define event payloads
export type ChatEvent = {
  requestId: string; // Changed from roomId to requestId
  message: unknown; // This will be the chat message object
};

export type ResourceEvent = {
  resourceType: string;
  resourceId: string;
  action: "created" | "updated" | "deleted";
  data: unknown;
  sourceUserId: string;
};

export type NotificationEvent = {
  userId: string; // Can be a specific user ID or 'all' or 'admins'
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  link?: string;
  sourceUserId: string;
};

// Create global event emitter
export const appEvents = new EventEmitter();
const MAX_LISTENERS = 1000;
// Increase max listeners to avoid warnings
appEvents.setMaxListeners(MAX_LISTENERS);
