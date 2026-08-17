// ─── Domain Entities (mirrors /airplane API contract) ─────────────────────

export type CabinTier = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
export type PassengerType = "ADULT" | "CHILD" | "INFANT";
export type BookingStatus = "PENDING" | "CREATED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentMethod = "CREDIT_CARD" | "BANK_TRANSFER" | "E_WALLET" | "CASH";
export type FlightStatus = "SCHEDULED" | "BOARDING" | "DEPARTED" | "IN_FLIGHT" | "DELAYED" | "ARRIVED" | "CANCELLED";
export type SeatType = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST_CLASS";
export type TicketStatus = "ISSUED" | "CANCELLED" | "REFUNDED" | "USED";

export interface Permission {
  name: string;
  description: string;
}

export interface Role {
  name: "ADMIN" | "CUSTOMER" | "STAFF" | string;
  description: string;
  permissions?: Permission[];
}



export interface User {
  id?: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dob?: string; // YYYY-MM-DD format
  nationality?: string;
  passportNumber?: string;
  address?: string;
  gender?: "MALE" | "FEMALE";
  isActive?: boolean;
  registeredAt?: string; // ISO-8601 DateTime string
  roles?: Role[];
}

export interface Airport {
  id?: number;
  code: string;
  name: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface Airline {
  id?: number;
  name: string;
  code: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface Aircraft {
  id?: number;
  model: string;
  registrationNumber: string;
  totalSeats: number;
  seatConfiguration?: string; // JSON string
  airline?: Airline;
}

export interface SeatConfigSegment {
  cabin: CabinTier;
  seats: number;
  basePriceMultiplier: number;
}

export interface FareRule {
  cabin: CabinTier;
  basePrice: number;
  refundable: boolean;
  changeFeeUSD: number;
}

export interface Flight {
  id?: number;
  flightNumber: string;
  departureAirport: Airport;
  destinationAirport: Airport;
  departureTime: string; // ISO-8601 DateTime string
  arrivalTime: string; // ISO-8601 DateTime string
  airline?: Airline;
  aircraft?: Aircraft;
  totalSeats?: number;
  availableSeats?: number;
  fareRules?: string; // JSON string
  flightStatus: FlightStatus;
}


export interface Passenger {
  id?: number;
  firstName: string;
  lastName: string;
  passengerType: PassengerType;
  dateOfBirth: string; // YYYY-MM-DD format
  passportNumber: string;
  nationality: string;
}


export interface Payment {
  id?: number;
  transactionRef: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string; // ISO-8601 DateTime string
  gatewayResponse?: string;
}

export interface Ticket {
  ticketNumber: string;
  seatType: SeatType;
  seatNumber?: string;
  price: number;
  status: TicketStatus;
  issuedAt: string; // ISO-8601 DateTime string
}

export interface Booking {
  id?: number;
  bookingCode: string;
  flight: Flight;
  user?: User;
  seatType: SeatType;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string; // ISO-8601 DateTime string
  passengers?: Passenger[];
  payments?: Payment[];
  tickets?: Ticket[];
}

// ─── API Response Wrapper (mirrors Spring Boot APIResponse<T>) ─────────────

export interface APIResponse<T> {
  code: number;
  message: string;
  result: T;
}

// ─── API Error Contract ────────────────────────────────────────────────────

export interface ApiErrorBody {
  code: number;
  message: string;
  httpStatus?: number;
  fieldErrors?: Record<string, string>;
}

export class ApiError extends Error {
  code: number;
  fieldErrors?: Record<string, string>;
  constructor(body: ApiErrorBody) {
    super(body.message);
    this.code = body.code;
    this.fieldErrors = body.fieldErrors;
  }
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface AuthTokenResponse {
  token: string;
  authenticated: boolean;
}

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
}

// ─── Search / Booking flow ─────────────────────────────────────────────────

export interface DraftPassenger extends Passenger {
  uid: string;
}

// ==========================================
// 3. REQUEST DTOs
// ==========================================

export interface UserRegistrationRequest {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface UserUpdateRequest {
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface PassengerRequest {
  firstName: string;
  lastName: string;
  passengerType: PassengerType;
  dateOfBirth: string; // YYYY-MM-DD
  passportNumber: string;
  nationality: string;
}

export interface CreateBookingRequest {
  user: Partial<User>; // Spring expects a User object, usually just `{ email: "..." }` is enough
  seatType: SeatType;
  passengers: PassengerRequest[];
  notes?: string;
}

export interface UpdateBookingRequest {
  status: BookingStatus;
  passengers: PassengerRequest[];
  notes?: string;
}

export interface CancelRequest {
  reason?: string;
}

// NOTE: Even though this says "Response" in Java, it is used as a Request body in the callback controller
export interface PaymentGatewayResponse {
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  gatewayResponse?: string;
}

export interface FlightSearchParams {
  from: string;
  to: string;
  startDate?: string; // ISO-8601 DateTime string
  endDate?: string; // ISO-8601 DateTime string
}

export interface PaymentRequest {
  bookingId: number;
  paymentMethod: PaymentMethod;
  amount: number;
}