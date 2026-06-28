// ─── Domain Entities (mirrors /airplane API contract) ─────────────────────

export type Permission = string;

export interface Role {
  name: "ADMIN" | "CUSTOMER" | "STAFF" | string;
  description: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  isActive: boolean;
  roles: Role[];
  createdAt: string;
}

export type CabinTier = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

export interface SeatConfigSegment {
  cabin: CabinTier;
  seats: number;
  basePriceMultiplier: number;
}

export interface Airport {
  id: string;
  iataCode: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface Airline {
  id: string;
  iataCarrierCode: string;
  operatorName: string;
  email: string;
  phone: string;
  logoColor?: string;
}

export interface Aircraft {
  id: string;
  model: string;
  tailRegistration: string;
  airlineCode: string;
  seatCapacity: number;
  seatConfig: SeatConfigSegment[];
}

export type FlightStatus =
  | "SCHEDULED"
  | "BOARDING"
  | "DEPARTED"
  | "DELAYED"
  | "CANCELLED"
  | "COMPLETED";

export interface FareRule {
  cabin: CabinTier;
  basePrice: number;
  refundable: boolean;
  changeFeeUSD: number;
}

export interface Flight {
  id: string;
  flightNumber: string;
  departureAirport: Airport;
  destinationAirport: Airport;
  departureTime: string; // ISO
  arrivalTime: string; // ISO
  airline: Airline;
  aircraft: Aircraft;
  totalSeats: number;
  availableSeats: number;
  fareRules: FareRule[];
  flightStatus: FlightStatus;
}

export type PassengerType = "ADULT" | "CHILD" | "INFANT";

export interface Passenger {
  id?: string;
  firstName: string;
  lastName: string;
  passengerType: PassengerType;
  dateOfBirth: string; // YYYY-MM-DD
  passportNumber: string;
  nationality: string;
}

export type BookingStatus = "CREATED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type PaymentMethod = "CREDIT_CARD" | "DIGITAL_WALLET";

export interface Payment {
  id: string;
  transactionRef: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paidAt: string | null;
  gatewayResponse?: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  passengerName: string;
  seatNumber: string;
  cabin: CabinTier;
  issuedAt: string;
}

export interface Booking {
  id: string;
  bookingCode: string;
  flight: Flight;
  bookedBy: string; // user email
  createdAt: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  seatType: CabinTier;
  passengers: Passenger[];
  tickets: Ticket[];
  payments: Payment[];
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

export interface FlightSearchParams {
  from: string;
  to: string;
  startDate: string;
  endDate?: string;
  passengers?: number;
  cabin?: CabinTier;
}

export interface DraftPassenger extends Passenger {
  uid: string;
}