import axiosInstance from "./axios";
import {
  Airline,
  Airport,
  Aircraft,
  Flight,
  Booking,
  Payment,
  User,
} from "@/types";

/**
 * Admin API — maps to Spring Boot AdminController.java.
 *
 * Every method returns the **unwrapped** result thanks to the
 * Axios response interceptor in `./axios.ts`.
 */
export const adminApi = {
  // --- AIRLINES ---
  airlines: {
    getAll: async (): Promise<Airline[]> => {
      const { data } = await axiosInstance.get<Airline[]>("/admin/airlines");
      return data;
    },
    create: async (payload: Partial<Airline>): Promise<Airline> => {
      const { data } = await axiosInstance.post<Airline>("/admin/airlines", payload);
      return data;
    },
    update: async (code: string, payload: Partial<Airline>): Promise<Airline> => {
      const { data } = await axiosInstance.put<Airline>(`/admin/airlines/${code}`, payload);
      return data;
    },
    delete: async (code: string): Promise<void> => {
      await axiosInstance.delete(`/admin/airlines/${code}`);
    },
  },

  // --- AIRPORTS ---
  airports: {
    getAll: async (): Promise<Airport[]> => {
      const { data } = await axiosInstance.get<Airport[]>("/admin/airports");
      return data;
    },
    create: async (payload: Partial<Airport>): Promise<Airport> => {
      const { data } = await axiosInstance.post<Airport>("/admin/airports", payload);
      return data;
    },
    update: async (code: string, payload: Partial<Airport>): Promise<Airport> => {
      const { data } = await axiosInstance.put<Airport>(`/admin/airports/${code}`, payload);
      return data;
    },
    delete: async (code: string): Promise<void> => {
      await axiosInstance.delete(`/admin/airports/${code}`);
    },
  },

  // --- AIRCRAFT ---
  aircrafts: {
    getAll: async (): Promise<Aircraft[]> => {
      const { data } = await axiosInstance.get<Aircraft[]>("/admin/aircrafts");
      return data;
    },
    create: async (airlineCode: string, payload: Partial<Aircraft>): Promise<Aircraft> => {
      const { data } = await axiosInstance.post<Aircraft>(
        `/admin/${airlineCode}/aircrafts`,
        payload
      );
      return data;
    },
    update: async (code: string, payload: Partial<Aircraft>): Promise<Aircraft> => {
      const { data } = await axiosInstance.put<Aircraft>(`/admin/aircrafts/${code}`, payload);
      return data;
    },
    delete: async (code: string): Promise<void> => {
      await axiosInstance.delete(`/admin/aircrafts/${code}`);
    },
  },

  // --- FLIGHTS ---
  flights: {
    getAll: async (): Promise<Flight[]> => {
      const { data } = await axiosInstance.get<Flight[]>("/admin/flights");
      return data;
    },
    search: async (params: Record<string, string>): Promise<Flight[]> => {
      const { data } = await axiosInstance.post<Flight[]>("/admin/flights/search", params);
      return data;
    },
    create: async (
      airlineCode: string,
      aircraftCode: string,
      departureCode: string,
      destinationCode: string,
      payload: Partial<Flight>
    ): Promise<Flight> => {
      const { data } = await axiosInstance.post<Flight>(
        `/admin/${airlineCode}/${aircraftCode}/${departureCode}/${destinationCode}/flights`,
        payload
      );
      return data;
    },
    update: async (code: string, payload: Partial<Flight>): Promise<Flight> => {
      const { data } = await axiosInstance.put<Flight>(`/admin/flights/${code}`, payload);
      return data;
    },
    delete: async (code: string): Promise<void> => {
      await axiosInstance.delete(`/admin/flights/${code}`);
    },
  },

  // --- BOOKINGS ---
  bookings: {
    getAll: async (): Promise<Booking[]> => {
      const { data } = await axiosInstance.get<Booking[]>("/admin/bookings");
      return data;
    },
    getByCode: async (code: string): Promise<Booking> => {
      const { data } = await axiosInstance.get<Booking>(`/admin/bookings/${code}`);
      return data;
    },
    search: async (
      airlineCode: string,
      aircraftCode: string,
      airportCode: string,
      flightNumber: string
    ): Promise<Booking[]> => {
      const { data } = await axiosInstance.get<Booking[]>(
        `/admin/bookings/${airlineCode}/${aircraftCode}/${airportCode}/${flightNumber}`
      );
      return data;
    },
  },

  // --- PAYMENTS ---
  payments: {
    getAll: async (): Promise<Payment[]> => {
      const { data } = await axiosInstance.get<Payment[]>("/admin/payments");
      return data;
    },
  },

  // --- USERS ---
  users: {
    getAll: async (): Promise<User[]> => {
      const { data } = await axiosInstance.get<User[]>("/admin/users");
      return data;
    },
    getByEmail: async (email: string): Promise<User> => {
      const { data } = await axiosInstance.get<User>(`/admin/users/${email}`);
      return data;
    },
    disable: async (email: string): Promise<void> => {
      await axiosInstance.put(`/admin/disable/${email}`);
    },
  },
};