import { ApiError, Booking, Flight, FlightSearchParams, User } from "@/types";
import { searchFlights as mockSearch, MOCK_FLIGHTS } from "@/lib/mock/flights";
import { getBookingsForUser } from "@/lib/mock/bookings";
import { MOCK_USERS } from "@/lib/mock/users";

// This module simulates calls to the real backend at /airplane (port 8080).
// Swap the bodies of these functions for real `fetch` calls against
// process.env.NEXT_PUBLIC_API_BASE_URL once the backend is live — the
// function signatures and thrown ApiError shape already match the contract.

const LATENCY_MS = 380;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const api = {
  flights: {
    async search(params: FlightSearchParams): Promise<Flight[]> {
      // POST /airplane/admin/flights/search (and public equivalent)
      const results = mockSearch({
        from: params.from,
        to: params.to,
        startDate: params.startDate,
        endDate: params.endDate,
      });
      return delay(results);
    },
    async get(id: string): Promise<Flight> {
      const flight = MOCK_FLIGHTS.find((f) => f.id === id);
      if (!flight) throw new ApiError({ code: 2001, message: "Flight not found." });
      return delay(flight);
    },
  },

  users: {
    async getMyInfo(email: string): Promise<User> {
      // GET /airplane/users
      const user = MOCK_USERS.find((u) => u.email === email);
      if (!user) throw new ApiError({ code: 1006, message: "User not found." });
      return delay(user);
    },
    async getMyBookings(email: string): Promise<Booking[]> {
      // GET /airplane/users/bookings
      return delay(getBookingsForUser(email));
    },
  },
};