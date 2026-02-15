import { faker } from "@faker-js/faker";
import { eq, inArray } from "drizzle-orm";
import { logger } from "@repo/logger";
import { db } from "../src";
import { user } from "../src/schemas/auth/auth-schema";
import { program } from "../src/schemas/program";
import { home } from "../src/schemas/home";
import { child } from "../src/schemas/child";
import { incidentReport } from "../src/schemas/incident";
import { notification } from "../src/schemas/notification";

const USER_ROLES = [
  "EXTERNAL",
  "SOS_MEMBER",
  "SOS_AUNT",
  "EDUCATOR",
  "PSYCHOLOGIST",
  "PROGRAM_DIRECTOR",
  "NATIONAL_DIRECTOR",
] as const;

// Test user emails (created by seed-admins.ts with password: "test123")
const TEST_USER_EMAILS = [
  "national@test.com",
  "director@test.com",
  "psychologist@test.com",
  "educator@test.com",
  "aunt@test.com",
  "member@test.com",
  "external@test.com",
];

const INCIDENT_TYPES = [
  "NON_SPECIFIED",
  "VIOLENCE_PHYSICAL",
  "VIOLENCE_SEXUAL",
  "VIOLENCE_PSYCHOLOGICAL",
  "NEGLECT",
  "HEALTH_EMERGENCY",
  "BEHAVIORAL_ISSUE",
  "PEER_CONFLICT",
  "OTHER",
] as const;

const URGENCY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const INCIDENT_STATUSES = ["PENDING", "IN_PROGRESS", "CLOSED"] as const;
const NOTIFICATION_TYPES = [
  "NEW_REPORT",
  "STATUS_UPDATE",
  "ASSIGNMENT",
  "DEADLINE_WARNING",
  "SYSTEM_ALERT",
] as const;

async function seed() {
  try {
    logger.info("Seeding the database");

    // Fetch existing test users (created by seed-admins.ts)
    const testUserIds = await db
      .select({ id: user.id, role: user.role, email: user.email })
      .from(user)
      .where(inArray(user.email, TEST_USER_EMAILS));

    if (testUserIds.length === 0) {
      logger.warn("No test users found. Run 'bun run db:seed:admins' in @repo/auth first.");
    } else {
      logger.info(`Found ${testUserIds.length} test users`);
    }

    // Insert additional random users
    const randomUserIds = await db
      .insert(user)
      .values(
        Array.from({ length: 15 }, (_, i) => ({
          id: crypto.randomUUID(),
          name: faker.person.fullName(),
          email: `user-${i}@example.com`,
          emailVerified: faker.datatype.boolean(0.8),
          image: faker.datatype.boolean(0.2) ? faker.image.avatar() : null,
          phone: faker.phone.number(),
          role:
            i < 2
              ? "PROGRAM_DIRECTOR"
              : i < 6
                ? "SOS_AUNT"
                : i < 9
                  ? "EDUCATOR"
                  : i < 12
                    ? "PSYCHOLOGIST"
                    : "SOS_MEMBER",
        }))
      )
      .returning({ id: user.id, role: user.role });

    const userIds = [...testUserIds, ...randomUserIds];

    const directors = userIds.filter((u) => u.role === "PROGRAM_DIRECTOR");
    const aunts = userIds.filter((u) => u.role === "SOS_AUNT");

    logger.info(`Seeded ${userIds.length} users`);

    const programRows = await db
      .insert(program)
      .values(
        directors.map((director) => ({
          name: `${faker.location.city()} Program`,
          region: faker.location.state(),
          address: faker.location.streetAddress(),
          contactEmail: faker.internet.email(),
          contactPhone: faker.phone.number(),
          directorId: director.id,
        }))
      )
      .returning({ id: program.id, directorId: program.directorId });

    logger.info(`Seeded ${programRows.length} programs`);

    for (const prog of programRows) {
      if (prog.directorId) {
        await db.update(user).set({ programId: prog.id }).where(eq(user.id, prog.directorId));
      }
    }

    const homeRows = await db
      .insert(home)
      .values(
        programRows.flatMap((prog, i) =>
          Array.from({ length: 3 }, (_, j) => {
            const auntIndex = (i * 3) + j;
            const auntId = aunts.at(auntIndex % aunts.length)?.id;
            return {
              programId: prog.id,
              name: `${faker.location.street()} Home`,
              address: faker.location.streetAddress(),
              capacity: faker.number.int({ min: 3, max: 10 }),
              auntId: auntId ?? null,
            };
          })
        )
      )
      .returning({ id: home.id, programId: home.programId });

    logger.info(`Seeded ${homeRows.length} homes`);

    const childRows = await db
      .insert(child)
      .values(
        homeRows.flatMap((h) =>
          Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => ({
            homeId: h.id,
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            dateOfBirth: faker.date.past({ years: 15 }).toISOString().split("T").at(0) ?? "2015-01-01",
            gender: faker.helpers.arrayElement(["M", "F"]),
            admissionDate: faker.date.past({ years: 2 }).toISOString().split("T").at(0),
            medicalNotes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
          }))
        )
      )
      .returning({ id: child.id, homeId: child.homeId });

    logger.info(`Seeded ${childRows.length} children`);

    const reporterIds = userIds.map((u) => u.id);
    const incidentRows = await db
      .insert(incidentReport)
      .values(
        Array.from({ length: 20 }, () => ({
          reporterId: faker.helpers.arrayElement(reporterIds),
          isAnonymous: faker.datatype.boolean(0.2),
          programId: faker.helpers.arrayElement(programRows).id,
          homeId: faker.helpers.arrayElement(homeRows).id,
          childId: faker.helpers.arrayElement(childRows).id,
          type: faker.helpers.arrayElement(INCIDENT_TYPES),
          urgencyLevel: faker.helpers.arrayElement(URGENCY_LEVELS),
          dateOfIncident: faker.date.recent({ days: 30 }),
          description: faker.lorem.paragraphs(2),
          status: faker.helpers.arrayElement(INCIDENT_STATUSES),
        }))
      )
      .returning({ id: incidentReport.id });

    logger.info(`Seeded ${incidentRows.length} incident reports`);

    await db.insert(notification).values(
      userIds.slice(0, 5).flatMap((u) =>
        Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
          userId: u.id,
          type: faker.helpers.arrayElement(NOTIFICATION_TYPES),
          message: faker.lorem.sentence(),
          isRead: faker.datatype.boolean(0.5),
        }))
      )
    );

    logger.info("Database seeding complete");
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error seeding the database: ${error.message}`, error);
    } else {
      logger.error(
        `Unknown error seeding the database: ${JSON.stringify(error)}`
      );
    }
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();
