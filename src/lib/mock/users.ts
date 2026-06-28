import { User } from "@/types";

export const ROLE_ADMIN = {
  name: "ADMIN" as const,
  description: "Full system access across infrastructure, scheduling, and accounts.",
  permissions: ["MANAGE_FLIGHTS", "MANAGE_USERS", "MANAGE_INFRASTRUCTURE", "VIEW_PAYMENTS"],
};

export const ROLE_CUSTOMER = {
  name: "CUSTOMER" as const,
  description: "Standard passenger account able to search, book, and manage trips.",
  permissions: ["BOOK_FLIGHT", "VIEW_OWN_BOOKINGS", "CANCEL_OWN_BOOKING"],
};

export const MOCK_USERS: User[] = [
  {
    id: "u-1",
    email: "admin@skylineair.com",
    username: "admin",
    firstName: "Mai",
    lastName: "Nguyen",
    phone: "+84 90 123 4567",
    isActive: true,
    roles: [ROLE_ADMIN],
    createdAt: "2024-01-10T08:00:00.000Z",
  },
  {
    id: "u-2",
    email: "linh.tran@example.com",
    username: "linhtran",
    firstName: "Linh",
    lastName: "Tran",
    phone: "+84 91 222 3344",
    isActive: true,
    roles: [ROLE_CUSTOMER],
    createdAt: "2024-03-22T10:30:00.000Z",
  },
  {
    id: "u-3",
    email: "david.kim@example.com",
    username: "dkim",
    firstName: "David",
    lastName: "Kim",
    phone: "+82 10 4455 6677",
    isActive: true,
    roles: [ROLE_CUSTOMER],
    createdAt: "2024-05-02T14:12:00.000Z",
  },
  {
    id: "u-4",
    email: "priya.sharma@example.com",
    username: "priyasharma",
    firstName: "Priya",
    lastName: "Sharma",
    phone: "+65 8123 9988",
    isActive: false,
    roles: [ROLE_CUSTOMER],
    createdAt: "2024-02-18T09:05:00.000Z",
  },
  {
    id: "u-5",
    email: "tom.wright@example.com",
    username: "twright",
    firstName: "Tom",
    lastName: "Wright",
    phone: "+44 7700 900123",
    isActive: true,
    roles: [ROLE_CUSTOMER],
    createdAt: "2024-06-30T17:45:00.000Z",
  },
];

export function findUserByEmail(email: string): User | undefined {
  return MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
}