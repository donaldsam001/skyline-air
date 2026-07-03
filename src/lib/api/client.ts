import { ApiError, Booking, Flight, FlightSearchParams, User, Airline, Aircraft, Airport,
  UserRegistrationRequest, UserUpdateRequest, CreateBookingRequest, UpdateBookingRequest,
  CancelRequest, PaymentGatewayResponse, Payment, AuthTokenResponse } from "@/types";
import { useAuthStore } from "@/lib/store/auth-store";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/airplane";

// Injects the JWT for endpoints secured by SecurityConfig.java
const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // ----------------------------------------------------
  // Authentication
  // ----------------------------------------------------
  auth: {
    async login(credentials: { email: string; password: string }): Promise<AuthTokenResponse> {
      const response = await fetch(`${BASE_URL}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) throw new ApiError({ code: response.status, message: "Login failed" });
      const data = await response.json();
      return data.result;
    },
    async logout(token: string): Promise<void> {
      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ token }),
      });
      if (!response.ok) throw new ApiError({ code: response.status, message: "Logout failed" });
    }
  },

  // ----------------------------------------------------
  // Flights (Admin/Public)
  // ----------------------------------------------------
  flights: {
    async search(params: FlightSearchParams): Promise<Flight[]> {
      const response = await fetch(`${BASE_URL}/admin/flights/search`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(params),
      });
      
      if (!response.ok) throw new ApiError({ code: response.status, message: "Search failed" });
      const data = await response.json();
      return data.result; 
    },
    
    async getAll(): Promise<Flight[]> {
      const response = await fetch(`${BASE_URL}/admin/flights`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) throw new ApiError({ code: response.status, message: "Failed to fetch flights" });
      const data = await response.json();
      return data.result;
    },
  },

  // ----------------------------------------------------
  // Users Profile, Bookings & Payments
  // ----------------------------------------------------
  users: {
    async register(data: UserRegistrationRequest): Promise<User> {
      const response = await fetch(`${BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new ApiError({ code: response.status, message: "Registration failed" });
      const resData = await response.json();
      return resData.result;
    },

    async getMyInfo(): Promise<User> {
      const response = await fetch(`${BASE_URL}/users`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) throw new ApiError({ code: response.status, message: "Profile access denied" });
      const data = await response.json();
      return data.result;
    },

    async updateUser(email: string, data: UserUpdateRequest): Promise<User> {
      const response = await fetch(`${BASE_URL}/users/update/${email}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new ApiError({ code: response.status, message: "Failed to update user" });
      
      const resData = await response.json();
      // updateUser in Java controller returns UserResponse directly (not wrapped in APIResponse)
      return resData; 
    },

    async getMyBookings(): Promise<Booking[]> {
      const response = await fetch(`${BASE_URL}/users/bookings`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) throw new ApiError({ code: response.status, message: "Failed to load bookings" });
      const data = await response.json();
      return data.result;
    },

    async createBooking(flightNumber: string, data: CreateBookingRequest): Promise<Booking> {
      const response = await fetch(`${BASE_URL}/users/${flightNumber}/booking`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new ApiError({ code: response.status, message: "Failed to create booking" });
      const resData = await response.json();
      return resData.result;
    },

    async updateBooking(code: string, data: UpdateBookingRequest): Promise<Booking> {
      const response = await fetch(`${BASE_URL}/users/booking/${code}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new ApiError({ code: response.status, message: "Failed to update booking" });
      const resData = await response.json();
      return resData.result;
    },

    async cancelBooking(bookingCode: string, data: CancelRequest): Promise<Booking> {
      const response = await fetch(`${BASE_URL}/users/booking/${bookingCode}/cancel`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new ApiError({ code: response.status, message: "Failed to cancel booking" });
      const resData = await response.json();
      return resData.result;
    },

    async handlePaymentCallback(transactionRef: string, data: PaymentGatewayResponse): Promise<Payment> {
      const response = await fetch(`${BASE_URL}/users/payment/callback/${transactionRef}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new ApiError({ code: response.status, message: "Payment callback failed" });
      const resData = await response.json();
      return resData.result;
    },

    async refundPayment(transactionRef: string): Promise<Payment> {
      const response = await fetch(`${BASE_URL}/users/payment/refund/${transactionRef}`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) throw new ApiError({ code: response.status, message: "Refund failed" });
      const resData = await response.json();
      return resData.result;
    }
  },

  // ----------------------------------------------------
  // Airlines (Admin)
  // ----------------------------------------------------
  airlines: {
    async getAll(): Promise<Airline[]> {
      const response = await fetch(`${BASE_URL}/admin/airlines`, { 
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new ApiError({ code: response.status, message: "Failed to fetch airlines" });
      const data = await response.json();
      return data.result; 
    },

    async create(data: Omit<Airline, "id">): Promise<Airline> {
      const response = await fetch(`${BASE_URL}/admin/airline`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError({ code: response.status, message: errorData.message || "Failed to create airline" });
      }
      const resData = await response.json();
      return resData.result;
    },

    async update(code: string, data: Partial<Airline>): Promise<Airline> {
      const response = await fetch(`${BASE_URL}/admin/airline/${code}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new ApiError({ code: response.status, message: "Failed to update airline" });
      const resData = await response.json();
      return resData.result;
    }
  },

  // ----------------------------------------------------
  // Aircraft (Admin)
  // ----------------------------------------------------
  aircraft: {
    async getAll(): Promise<Aircraft[]> {
      const response = await fetch(`${BASE_URL}/admin/aircraft`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new ApiError({ code: response.status, message: "Failed to fetch aircraft" });
      const data = await response.json();
      return data.result; 
    },

    // Backend requires `airlineCode` in path variable to create an Aircraft
    async create(airlineCode: string, data: Omit<Aircraft, "id">): Promise<Aircraft> {
      const response = await fetch(`${BASE_URL}/admin/aircraft/${airlineCode}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError({ code: response.status, message: errorData.message || "Failed to create aircraft" });
      }
      const resData = await response.json();
      return resData.result;
    },

    // Identifies aircraft by its unique registration code
    async update(code: string, data: Partial<Aircraft>): Promise<Aircraft> {
      const response = await fetch(`${BASE_URL}/admin/aircraft/${code}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new ApiError({ code: response.status, message: "Failed to update aircraft" });
      const resData = await response.json();
      return resData.result;
    }
  },

  // ----------------------------------------------------
  // Airports (Admin)
  // ----------------------------------------------------
  airports: {
    async getAll(): Promise<Airport[]> {
      const response = await fetch(`${BASE_URL}/admin/airports`, { 
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new ApiError({ code: response.status, message: "Failed to fetch airports" });
      const data = await response.json();
      return data.result; 
    },

    async create(data: Omit<Airport, "id">): Promise<Airport> {
      const response = await fetch(`${BASE_URL}/admin/airport`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError({ code: response.status, message: errorData.message || "Failed to create airport" });
      }
      const resData = await response.json();
      return resData.result;
    },

    async update(code: string, data: Partial<Airport>): Promise<Airport> {
      const response = await fetch(`${BASE_URL}/admin/airport/${code}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new ApiError({ code: response.status, message: "Failed to update airport" });
      const resData = await response.json();
      return resData.result;
    }
  }
};