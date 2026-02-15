import { z } from "zod";
import { attachmentType, incidentStatus, incidentType, urgencyLevel } from "@repo/db/schemas/enums";

// Enums from DB schema are not directly importable as Zod enums easily unless we redefine them
// or use z.nativeEnum if they were TS enums. Drizzle enums are objects.
// Let's redefine for Zod to be safe and decoupled.
const IncidentTypeEnum = z.enum(["ABUSE", "NEGLECT", "ACCIDENT", "BEHAVIORAL", "OTHER"]);
const UrgencyLevelEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
const IncidentStatusEnum = z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"]);
const AttachmentTypeEnum = z.enum(["IMAGE", "VIDEO", "DOCUMENT", "AUDIO"]);

export const createIncidentInput = z.object({
    reporterId: z.string().uuid().optional(), // Optional if we infer from ctx.user, but might be needed for admin creation
    isAnonymous: z.boolean().default(false),
    programId: z.string().uuid(),
    homeId: z.string().uuid().optional().nullable(),
    childId: z.string().uuid().optional().nullable(),
    childNameFallback: z.string().optional().nullable(),
    abuserId: z.string().optional().nullable(), // references user.id which is string (uuid)
    abuserName: z.string().optional().nullable(),
    abuserRelation: z.string().optional().nullable(),
    type: IncidentTypeEnum,
    urgencyLevel: UrgencyLevelEnum,
    dateOfIncident: z.string().or(z.date()).optional().nullable(),
    description: z.string().min(10),
    aiSeverityScore: z.number().int().optional().nullable(),
    aiKeywordsDetected: z.string().optional().nullable(),
    attachments: z.array(z.object({
        fileUrl: z.string().url(),
        fileType: AttachmentTypeEnum,
        originalFileName: z.string().optional().nullable(),
        fileSizeBytes: z.number().int().optional().nullable(),
    })).optional(),
});

export const updateIncidentInput = z.object({
    isAnonymous: z.boolean().optional(),
    programId: z.string().uuid().optional(),
    homeId: z.string().uuid().optional().nullable(),
    childId: z.string().uuid().optional().nullable(),
    childNameFallback: z.string().optional().nullable(),
    abuserId: z.string().optional().nullable(),
    abuserName: z.string().optional().nullable(),
    abuserRelation: z.string().optional().nullable(),
    type: IncidentTypeEnum.optional(),
    urgencyLevel: UrgencyLevelEnum.optional(),
    dateOfIncident: z.string().or(z.date()).optional().nullable(),
    description: z.string().min(10).optional(),
    status: IncidentStatusEnum.optional(),
    assignedTo: z.string().optional().nullable(), // references user.id
    aiSeverityScore: z.number().int().optional().nullable(),
    aiKeywordsDetected: z.string().optional().nullable(),
});

const deleteByIdsSchema = z.union([
    z.array(z.string().uuid()),
    z.object({ deletedIds: z.array(z.string().uuid()) }),
]);

const findOneQuerySchema = z.object({
    where: z.object({ id: z.string().uuid() }),
    with: z.record(z.any()).optional(),
});

const paginatedQuerySchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    where: z.record(z.any()).optional(),
    with: z.record(z.any()).optional(),
    sortBy: z
        .array(z.object({ id: z.string(), desc: z.boolean().optional() }))
        .optional(),
});

export const incidentValidators = {
    createInput: createIncidentInput,
    updateInput: z.object({ where: z.object({ id: z.string().uuid() }), data: updateIncidentInput }),
    deleteInput: deleteByIdsSchema,
    findOneInput: findOneQuerySchema,
    findManyPaginatedInput: paginatedQuerySchema,
} as const;

export type CreateIncidentInput = z.infer<typeof incidentValidators.createInput>;
export type UpdateIncidentInput = z.infer<typeof incidentValidators.updateInput>;
export type DeleteIncidentsInput = z.infer<typeof incidentValidators.deleteInput>;
export type IncidentFindOneInput = z.infer<typeof incidentValidators.findOneInput>;
export type IncidentsPaginatedInput = z.infer<typeof incidentValidators.findManyPaginatedInput>;
