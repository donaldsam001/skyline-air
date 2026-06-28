// Mirrors the backend's custom ErrorCode enum. Each numeric code maps to a
// user-facing message and, where relevant, the field it should attach to.

export interface ErrorCodeEntry {
  message: string;
  field?: string;
}

export const ERROR_CODES: Record<number, ErrorCodeEntry> = {
  1001: { message: "Uncategorized error. Please try again." },
  1002: { message: "An account with this email already exists.", field: "email" },
  1003: { message: "Username must be at least 4 characters.", field: "username" },
  1045: {
    message:
      "Password must be at least 8 characters and contain an uppercase letter, a lowercase letter, a number, and one of !@#$%^&*.",
    field: "password",
  },
  1006: { message: "User not found." },
  1007: { message: "Incorrect email or password.", field: "password" },
  1008: { message: "Your session has expired. Please sign in again." },
  1009: { message: "You don't have permission to perform this action." },
  1010: { message: "This account has been disabled. Contact support." },
  2001: { message: "Flight not found." },
  2002: { message: "Not enough available seats in the selected cabin.", field: "seatType" },
  2003: { message: "Departure date must be in the future.", field: "departureTime" },
  2004: { message: "Flight number already exists for this airline.", field: "flightNumber" },
  3001: { message: "Booking not found." },
  3002: { message: "This booking can no longer be cancelled.", field: "status" },
  3003: { message: "At least one passenger is required.", field: "passengers" },
  3004: { message: "Passport number format is invalid.", field: "passportNumber" },
  3005: { message: "Date of birth is invalid for the selected passenger type.", field: "dateOfBirth" },
  4001: { message: "Payment was declined by the card issuer.", field: "paymentMethod" },
  4002: { message: "Transaction reference could not be verified." },
  4003: { message: "Refund could not be processed automatically. Our team will follow up." },
  5001: { message: "Airport with this IATA code already exists.", field: "iataCode" },
  5002: { message: "Airline with this carrier code already exists.", field: "iataCarrierCode" },
  5003: { message: "Aircraft tail registration already exists.", field: "tailRegistration" },
};

export function resolveErrorCode(code: number): ErrorCodeEntry {
  return ERROR_CODES[code] ?? { message: "Something went wrong. Please try again." };
}