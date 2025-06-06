import { type User } from 'wasp/entities';
import { faker } from '@faker-js/faker';
import type { PrismaClient } from '@prisma/client';

type MockUserData = Omit<User, 'id'>;

/**
 * This function, which we've imported in `app.db.seeds` in the `main.wasp` file,
 * seeds the database with mock users via the `wasp db seed` command.
 * For more info see: https://wasp.sh/docs/data-model/backends#seeding-the-database
 */
export async function seedMockUsers(prismaClient: PrismaClient) {
  await Promise.all(generateMockUsersData(50).map((data) => prismaClient.user.create({ data })));
}

function generateMockUsersData(numOfUsers: number): MockUserData[] {
  return faker.helpers.multiple(generateMockUserData, { count: numOfUsers });
}

function generateMockUserData(): MockUserData {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const now = new Date();
  const createdAt = faker.date.past({ refDate: now });

  return {
    email: faker.internet.email({ firstName, lastName }),
    username: faker.internet.userName({ firstName, lastName }),
    createdAt,
    isAdmin: false,
    paymentProcessorUserId: null,
    lemonSqueezyCustomerPortalUrl: null,
    subscriptionStatus: null,
    subscriptionPlan: null,
    datePaid: null,
    credits: 3
  };
}
