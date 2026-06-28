import { Booking } from "@/types";
import { MOCK_FLIGHTS } from "./flights";

function flightAt(index: number) {
  return MOCK_FLIGHTS[index % MOCK_FLIGHTS.length];
}

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "bk-1",
    bookingCode: "SKY8X2Q",
    flight: flightAt(3),
    bookedBy: "linh.tran@example.com",
    createdAt: "2026-06-18T03:12:00.000Z",
    status: "CONFIRMED",
    paymentStatus: "PAID",
    totalPrice: 286,
    seatType: "ECONOMY",
    passengers: [
      {
        id: "ps-1",
        firstName: "Linh",
        lastName: "Tran",
        passengerType: "ADULT",
        dateOfBirth: "1994-04-12",
        passportNumber: "C1234567",
        nationality: "Vietnam",
      },
    ],
    tickets: [
      {
        id: "tk-1",
        ticketNumber: "VN-7741209384",
        passengerName: "Linh Tran",
        seatNumber: "14C",
        cabin: "ECONOMY",
        issuedAt: "2026-06-18T03:14:00.000Z",
      },
    ],
    payments: [
      {
        id: "pay-1",
        transactionRef: "TXN-99281",
        amount: 286,
        paymentMethod: "CREDIT_CARD",
        status: "PAID",
        paidAt: "2026-06-18T03:13:30.000Z",
      },
    ],
  },
  {
    id: "bk-2",
    bookingCode: "SKY4M9L",
    flight: flightAt(11),
    bookedBy: "linh.tran@example.com",
    createdAt: "2026-06-20T11:40:00.000Z",
    status: "CREATED",
    paymentStatus: "PENDING",
    totalPrice: 642,
    seatType: "PREMIUM_ECONOMY",
    passengers: [
      {
        id: "ps-2",
        firstName: "Linh",
        lastName: "Tran",
        passengerType: "ADULT",
        dateOfBirth: "1994-04-12",
        passportNumber: "C1234567",
        nationality: "Vietnam",
      },
      {
        id: "ps-3",
        firstName: "Minh",
        lastName: "Tran",
        passengerType: "CHILD",
        dateOfBirth: "2017-09-03",
        passportNumber: "C7654321",
        nationality: "Vietnam",
      },
    ],
    tickets: [],
    payments: [
      {
        id: "pay-2",
        transactionRef: "TXN-99340",
        amount: 642,
        paymentMethod: "DIGITAL_WALLET",
        status: "PENDING",
        paidAt: null,
      },
    ],
  },
  {
    id: "bk-3",
    bookingCode: "SKY1Z7K",
    flight: flightAt(22),
    bookedBy: "linh.tran@example.com",
    createdAt: "2026-05-02T08:00:00.000Z",
    status: "CANCELLED",
    paymentStatus: "REFUNDED",
    totalPrice: 198,
    seatType: "ECONOMY",
    passengers: [
      {
        id: "ps-4",
        firstName: "Linh",
        lastName: "Tran",
        passengerType: "ADULT",
        dateOfBirth: "1994-04-12",
        passportNumber: "C1234567",
        nationality: "Vietnam",
      },
    ],
    tickets: [],
    payments: [
      {
        id: "pay-3",
        transactionRef: "TXN-88120",
        amount: 198,
        paymentMethod: "CREDIT_CARD",
        status: "REFUNDED",
        paidAt: "2026-05-02T08:01:00.000Z",
      },
    ],
  },
  {
    id: "bk-4",
    bookingCode: "SKY5P3D",
    flight: flightAt(40),
    bookedBy: "linh.tran@example.com",
    createdAt: "2026-04-11T15:22:00.000Z",
    status: "COMPLETED",
    paymentStatus: "PAID",
    totalPrice: 1340,
    seatType: "BUSINESS",
    passengers: [
      {
        id: "ps-5",
        firstName: "Linh",
        lastName: "Tran",
        passengerType: "ADULT",
        dateOfBirth: "1994-04-12",
        passportNumber: "C1234567",
        nationality: "Vietnam",
      },
    ],
    tickets: [
      {
        id: "tk-2",
        ticketNumber: "SQ-1182734455",
        passengerName: "Linh Tran",
        seatNumber: "3A",
        cabin: "BUSINESS",
        issuedAt: "2026-04-11T15:25:00.000Z",
      },
    ],
    payments: [
      {
        id: "pay-4",
        transactionRef: "TXN-77002",
        amount: 1340,
        paymentMethod: "CREDIT_CARD",
        status: "PAID",
        paidAt: "2026-04-11T15:24:10.000Z",
      },
    ],
  },
];

export function getBookingsForUser(email: string): Booking[] {
  return MOCK_BOOKINGS.filter((b) => b.bookedBy.toLowerCase() === email.toLowerCase());
}

export function findBookingByCode(code: string): Booking | undefined {
  return MOCK_BOOKINGS.find((b) => b.bookingCode === code);
}