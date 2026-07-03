import { useAuthStore } from "@/lib/store/auth-store";

// Use your environment variable or fallback to the local backend URL
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/airplane";

// 1. Helper to inject JWT token
const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// 2. Helper to fetch and unwrap APIResponse<T>.result
async function fetchAdminApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}/admin${endpoint}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  // Your Spring Boot backend returns { result: T, ... }
  const data = await response.json();
  return data.result as T;
}

// 3. The API mapping matching AdminController.java
export const adminApi = {
  
  // --- AIRLINES ---
  airlines: {
    getAll: () => fetchAdminApi<any[]>("/airlines"),
    create: (data: any) => fetchAdminApi<any>("/airlines", { method: "POST", body: JSON.stringify(data) }),
    update: (code: string, data: any) => fetchAdminApi<any>(`/airlines/${code}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (code: string) => fetchAdminApi<any>(`/airlines/${code}`, { method: "DELETE" }),
    },

  // --- AIRPORTS ---
  airports: {
    getAll: () => fetchAdminApi<any[]>("/airports"),
    create: (data: any) => fetchAdminApi<any>("/airports", { method: "POST", body: JSON.stringify(data) }),
    update: (code: string, data: any) => fetchAdminApi<any>(`/airports/${code}`, { method: "PUT", body: JSON.stringify(data) }),
  },

  // --- AIRCRAFT ---
  aircrafts: {
    getAll: () => fetchAdminApi<any[]>("/aircrafts"),
    create: (airlineCode: string, data: any) => 
      fetchAdminApi<any>(`/${airlineCode}/aircrafts`, { method: "POST", body: JSON.stringify(data) }),
    update: (code: string, data: any) => 
      fetchAdminApi<any>(`/aircrafts/${code}`, { method: "PUT", body: JSON.stringify(data) }),
  },

  // --- FLIGHTS ---
  flights: {
    getAll: () => fetchAdminApi<any[]>("/flights"),
    search: (data: any) => fetchAdminApi<any[]>("/flights/search", { method: "POST", body: JSON.stringify(data) }),
    create: (airlineCode: string, aircraftCode: string, departureCode: string, destinationCode: string, data: any) => 
      fetchAdminApi<any>(`/${airlineCode}/${aircraftCode}/${departureCode}/${destinationCode}/flight`, { method: "POST", body: JSON.stringify(data) }),
    update: (code: string, data: any) => 
      fetchAdminApi<any>(`/flights/${code}`, { method: "PUT", body: JSON.stringify(data) }),
  },

  // --- BOOKINGS ---
  bookings: {
    getAll: () => fetchAdminApi<any[]>("/bookings"),
    getByCode: (code: string) => fetchAdminApi<any>(`/bookings/${code}`),
    search: (airlineCode: string, aircraftCode: string, airportCode: string, flightNumber: string) => 
      fetchAdminApi<any[]>(`/bookings/${airlineCode}/${aircraftCode}/${airportCode}/${flightNumber}`),
  },

  // --- PAYMENTS ---
  payments: {
    getAll: () => fetchAdminApi<any[]>("/payments"), 
  },

  // --- USERS ---
  users: {
    getAll: () => fetchAdminApi<any[]>("/users"),
    getByEmail: (email: string) => fetchAdminApi<any>(`/users/${email}`),
    disable: (email: string) => fetchAdminApi<any>(`/disable/${email}`, { method: "PUT" }),
  }
};