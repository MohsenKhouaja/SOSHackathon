import { logger } from "@repo/logger";
import { auth } from ".";
import { env } from "./env";

// Test users for each role (development only)
const testUsers = [
  {
    name: "National Director",
    email: "nationalDirector@gmail.com",
    password: "test123",
    appRole: "NATIONAL_DIRECTOR",
  },
  {
    name: "Program Director",
    email: "programDirector@gmail.com",
    password: "test123",
    appRole: "PROGRAM_DIRECTOR",
  },
  {
    name: "Test Psychologist",
    email: "psychologist@gmail.com",
    password: "test123",
    appRole: "PSYCHOLOGIST",
  },
  {
    name: "Test Educator",
    email: "educator@gmail.com",
    password: "test123",
    appRole: "EDUCATOR",
  },
  {
    name: "Test SOS Aunt",
    email: "sosAunt@gmail.com",
    password: "test123",
    appRole: "SOS_AUNT",
  },
  {
    name: "Test SOS Member",
    email: "sosMember@gmail.com",
    password: "test123",
    appRole: "SOS_MEMBER",
  },
  {
    name: "External User",
    email: "externalUser@gmail.com",
    password: "test123",
    appRole: "EXTERNAL",
  },
];

const admins =
  env.NODE_ENV === "development"
    ? [
        // Generic team admins
        {
          name: "National Director",
          email: "nationalDirector@gmail.com",
          password: "123456",
          appRole: "NATIONAL_DIRECTOR",
        },
        {
          name: "Program Director",
          email: "programDirector@gmail.com",
          password: "123456",
          appRole: "PROGRAM_DIRECTOR",
        },
        // Test users for all roles
        ...testUsers,
      ]
    : [
        {
          name: "National Director",
          email: "nationalDirector@gmail.com",
          password: "123456",
          appRole: "NATIONAL_DIRECTOR",
        },
        {
          name: "Program Director",
          email: "programDirector@gmail.com",
          password: "123456",
          appRole: "PROGRAM_DIRECTOR",
        },
      ];

export async function createAdmins() {
  for (const admin of admins) {
    try {
      // Use Better Auth's createUser API to create admin users
      // 'role' is Better Auth's internal role for access control
      // 'appRole' is stored in the user.role column for application logic
      await auth.api.createUser({
        body: {
          email: admin.email,
          password: admin.password,
          name: admin.name,
          role: "admin", // Better Auth admin plugin role
          data: {
            role: admin.appRole, // Application role (UserRole enum)
          },
        },
      });
      logger.info(`Created admin user: ${admin.name} (${admin.email})`);
    } catch (error) {
      console.error(error);
      logger.error(
        `Failed to create admin user ${admin.name}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }
}

createAdmins();
