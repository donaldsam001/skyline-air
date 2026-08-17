import axiosInstance from "./axios";
import {
  AuthTokenResponse,
  Booking,
  Flight,
  FlightSearchParams,
  User,
  Airline,
  Aircraft,
  Airport,
  UserRegistrationRequest,
  UserUpdateRequest,
  CreateBookingRequest,
  UpdateBookingRequest,
  CancelRequest,
  PaymentGatewayResponse,
  Payment,
  PaymentRequest,
} from "@/types";

/**
 * Client-facing API — maps to Spring Boot UserController, FlightController,
 * AuthenticationController, and public lookup endpoints.
 *
 * Every method returns the **unwrapped** result because the Axios
 * response interceptor in `./axios.ts` strips the APIResponse wrapper.
 */
export const api = {
  // ----------------------------------------------------
  // Authentication
  // ----------------------------------------------------
  auth: {
    /** POST /auth/token — returns {token, authenticated} */
    async login(credentials: { email: string; password: string }): Promise<AuthTokenResponse> {
      const { data } = await axiosInstance.post<AuthTokenResponse>("/auth/token", credentials);
      return data;
    },

    /** POST /auth/logout */
    async logout(token: string): Promise<void> {
      await axiosInstance.post("/auth/logout", { token });
    },
  },

  // ----------------------------------------------------
  // Flights (Search & Detail)"/flights/search/round-trip")
  // ----------------------------------------------------
  flights: {
    async searchRoundTrip(params: FlightSearchParams): Promise<Flight[]> {
      const { data } = await axiosInstance.post<Flight[]>("/admin/flights/search/round-trip", params);
      return data;
    },

    /** POST /admin/flights/search — search by route & dates */
    async search(params: FlightSearchParams): Promise<Flight[]> {
      const { data } = await axiosInstance.post<Flight[]>("/admin/flights/search", params);
      return data;
    },

    /** GET /admin/flights — all flights */
    async getAll(): Promise<Flight[]> {
      const { data } = await axiosInstance.get<Flight[]>("/admin/flights");
      return data;
    },

    /** GET /admin/flights/{flightNumber} — single flight detail */
    async get(flightNumber: string): Promise<Flight> {
      const { data } = await axiosInstance.get<Flight>(`/admin/flights/${flightNumber}`);
      return data;
    },
  },

  // ----------------------------------------------------
  // Users: Profile, Bookings & Payments
  // ----------------------------------------------------
  users: {
    /** POST /users — register new user */
    async register(payload: UserRegistrationRequest): Promise<User> {
      const { data } = await axiosInstance.post<User>("/users", payload);
      return data;
    },

    /** GET /users — get current user's profile (JWT-based) */
    async getMyInfo(): Promise<User> {
      const { data } = await axiosInstance.get<User>("/users");
      return data;
    },

    /** PUT /users/update/{email} */
    async updateUser(email: string, payload: UserUpdateRequest): Promise<User> {
      const { data } = await axiosInstance.put<User>(`/users/update/${email}`, payload);
      return data;
    },

    /** GET /users/bookings — current user's bookings */
    async getMyBookings(): Promise<Booking[]> {
      const { data } = await axiosInstance.get<Booking[]>("/users/bookings");
      return data;
    },

    /** POST /users/{flightNumber}/booking — create booking */
    async createBooking(flightNumber: string, payload: CreateBookingRequest): Promise<Booking> {
      const { data } = await axiosInstance.post<Booking>(
        `/users/${flightNumber}/booking`,
        payload
      );
      return data;
    },

    /** PUT /users/booking/{bookingCode} — update booking */
    async updateBooking(code: string, payload: UpdateBookingRequest): Promise<Booking> {
      const { data } = await axiosInstance.put<Booking>(`/users/booking/${code}`, payload);
      return data;
    },

    /** POST /users/booking/{bookingCode}/cancel */
    async cancelBooking(bookingCode: string, payload: CancelRequest): Promise<Booking> {
      const { data } = await axiosInstance.post<Booking>(
        `/users/booking/${bookingCode}/cancel`,
        payload
      );
      return data;
    },

    /** POST /users/payment/callback/{transactionRef} — simulate payment callback */
    async handlePaymentCallback(
      transactionRef: string,
      payload: PaymentGatewayResponse
    ): Promise<Payment> {
      const { data } = await axiosInstance.post<Payment>(
        `/users/payment/callback/${transactionRef}`,
        payload
      );
      return data;
    },

    /** POST /users/payment/refund/{transactionRef} */
    async refundPayment(transactionRef: string): Promise<Payment> {
      const { data } = await axiosInstance.post<Payment>(
        `/users/payment/refund/${transactionRef}`
      );
      return data;
    },
  },

  // ----------------------------------------------------
  // Airlines (public lookup)
  // ----------------------------------------------------
  airlines: {
    async getAll(): Promise<Airline[]> {
      const { data } = await axiosInstance.get<Airline[]>("/admin/airlines");
      return data;
    },
  },

  // ----------------------------------------------------
  // Aircraft (public lookup)
  // ----------------------------------------------------
  aircraft: {
    async getAll(): Promise<Aircraft[]> {
      const { data } = await axiosInstance.get<Aircraft[]>("/admin/aircraft");
      return data;
    },
  },

  // ----------------------------------------------------
  // Airports (public lookup)
  // ----------------------------------------------------
  airports: {
    async getAll(): Promise<Airport[]> {
      const { data } = await axiosInstance.get<Airport[]>("/admin/airports");
      return data;
    },
  },
};