import { Flight, FlightStatus } from "@/types";
import { MOCK_AIRPORTS, MOCK_AIRLINES, findAirport, findAirline } from "./airports-airlines";
import { MOCK_AIRCRAFT } from "./aircraft";

// Deterministic-ish pseudo-random so SSR/CSR renders match without hydration drift.
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const ROUTES: Array<{ from: string; to: string; durationMin: number; airline: string; aircraftId: string }> = [
  { from: "SGN", to: "HAN", durationMin: 125, airline: "VN", aircraftId: "ac-2" },
  { from: "HAN", to: "SGN", durationMin: 125, airline: "VN", aircraftId: "ac-2" },
  { from: "SGN", to: "DAD", durationMin: 80, airline: "VJ", aircraftId: "ac-3" },
  { from: "DAD", to: "SGN", durationMin: 80, airline: "VJ", aircraftId: "ac-3" },
  { from: "SGN", to: "SIN", durationMin: 135, airline: "SQ", aircraftId: "ac-4" },
  { from: "SIN", to: "SGN", durationMin: 135, airline: "SQ", aircraftId: "ac-4" },
  { from: "HAN", to: "BKK", durationMin: 150, airline: "TG", aircraftId: "ac-5" },
  { from: "BKK", to: "HAN", durationMin: 150, airline: "TG", aircraftId: "ac-5" },
  { from: "SGN", to: "NRT", durationMin: 360, airline: "VN", aircraftId: "ac-1" },
  { from: "NRT", to: "SGN", durationMin: 390, airline: "VN", aircraftId: "ac-1" },
  { from: "HAN", to: "ICN", durationMin: 280, airline: "VN", aircraftId: "ac-2" },
  { from: "SGN", to: "SYD", durationMin: 490, airline: "VN", aircraftId: "ac-1" },
  { from: "SGN", to: "LHR", durationMin: 740, airline: "SQ", aircraftId: "ac-4" },
  { from: "SGN", to: "DXB", durationMin: 460, airline: "TG", aircraftId: "ac-5" },
];

const STATUS_POOL: FlightStatus[] = [
  "SCHEDULED", "SCHEDULED", "SCHEDULED", "SCHEDULED", "SCHEDULED",
  "BOARDING", "DELAYED",
];

function generateFlights(): Flight[] {
  const flights: Flight[] = [];
  const rand = seededRandom(42);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let counter = 1000;
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    for (const route of ROUTES) {
      // not every route flies every day — pseudo-random skip for realism
      if (rand() < 0.18) continue;

      const dep = findAirport(route.from)!;
      const dest = findAirport(route.to)!;
      const airline = findAirline(route.airline)!;
      const aircraft = MOCK_AIRCRAFT.find((a) => a.id === route.aircraftId)!;

      const depHour = 5 + Math.floor(rand() * 17); // 5am - 10pm
      const depMin = Math.floor(rand() * 12) * 5;
      const departureTime = new Date(today);
      departureTime.setDate(today.getDate() + dayOffset);
      departureTime.setHours(depHour, depMin, 0, 0);

      const arrivalTime = new Date(departureTime.getTime() + route.durationMin * 60000);

      const seatsSoldRatio = 0.15 + rand() * 0.75;
      const availableSeats = Math.max(0, Math.round(aircraft.seatCapacity * (1 - seatsSoldRatio)));

      const basePrice = 45 + Math.round(route.durationMin * 0.62);

      const fareRules = aircraft.seatConfig.map((seg) => ({
        cabin: seg.cabin,
        basePrice: Math.round(basePrice * seg.basePriceMultiplier),
        refundable: seg.cabin !== "ECONOMY",
        changeFeeUSD: seg.cabin === "ECONOMY" ? 35 : 0,
      }));

      const status: FlightStatus =
        dayOffset === 0 && depHour <= today.getHours()
          ? "DEPARTED"
          : STATUS_POOL[Math.floor(rand() * STATUS_POOL.length)];

      counter += 1;
      flights.push({
        id: `fl-${counter}`,
        flightNumber: `${route.airline}${100 + (counter % 800)}`,
        departureAirport: dep,
        destinationAirport: dest,
        departureTime: departureTime.toISOString(),
        arrivalTime: arrivalTime.toISOString(),
        airline,
        aircraft,
        totalSeats: aircraft.seatCapacity,
        availableSeats,
        fareRules,
        flightStatus: status,
      });
    }
  }
  return flights;
}

export const MOCK_FLIGHTS: Flight[] = generateFlights();

export function searchFlights(params: {
  from?: string;
  to?: string;
  startDate?: string;
  endDate?: string;
}): Flight[] {
  return MOCK_FLIGHTS.filter((f) => {
    if (params.from && f.departureAirport.iataCode !== params.from) return false;
    if (params.to && f.destinationAirport.iataCode !== params.to) return false;
    const depDate = f.departureTime.slice(0, 10);
    if (params.startDate && depDate < params.startDate) return false;
    if (params.endDate && depDate > params.endDate) return false;
    return true;
  }).sort((a, b) => a.departureTime.localeCompare(b.departureTime));
}

export function findFlight(id: string): Flight | undefined {
  return MOCK_FLIGHTS.find((f) => f.id === id);
}

export { MOCK_AIRPORTS, MOCK_AIRLINES };