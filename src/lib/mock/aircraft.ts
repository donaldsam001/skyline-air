import { Aircraft } from "@/types";

export const MOCK_AIRCRAFT: Aircraft[] = [
  {
    id: "ac-1",
    model: "Airbus A350-900",
    tailRegistration: "VN-A899",
    airlineCode: "VN",
    seatCapacity: 305,
    seatConfig: [
      { cabin: "FIRST", seats: 8, basePriceMultiplier: 4.2 },
      { cabin: "BUSINESS", seats: 30, basePriceMultiplier: 2.6 },
      { cabin: "PREMIUM_ECONOMY", seats: 45, basePriceMultiplier: 1.5 },
      { cabin: "ECONOMY", seats: 222, basePriceMultiplier: 1 },
    ],
  },
  {
    id: "ac-2",
    model: "Boeing 787-9 Dreamliner",
    tailRegistration: "VN-A871",
    airlineCode: "VN",
    seatCapacity: 274,
    seatConfig: [
      { cabin: "BUSINESS", seats: 28, basePriceMultiplier: 2.4 },
      { cabin: "PREMIUM_ECONOMY", seats: 35, basePriceMultiplier: 1.45 },
      { cabin: "ECONOMY", seats: 211, basePriceMultiplier: 1 },
    ],
  },
  {
    id: "ac-3",
    model: "Airbus A321neo",
    tailRegistration: "VJ-A123",
    airlineCode: "VJ",
    seatCapacity: 230,
    seatConfig: [
      { cabin: "BUSINESS", seats: 12, basePriceMultiplier: 2.1 },
      { cabin: "ECONOMY", seats: 218, basePriceMultiplier: 1 },
    ],
  },
  {
    id: "ac-4",
    model: "Boeing 777-300ER",
    tailRegistration: "9V-SQA",
    airlineCode: "SQ",
    seatCapacity: 340,
    seatConfig: [
      { cabin: "FIRST", seats: 4, basePriceMultiplier: 5 },
      { cabin: "BUSINESS", seats: 42, basePriceMultiplier: 2.8 },
      { cabin: "PREMIUM_ECONOMY", seats: 24, basePriceMultiplier: 1.5 },
      { cabin: "ECONOMY", seats: 270, basePriceMultiplier: 1 },
    ],
  },
  {
    id: "ac-5",
    model: "Airbus A330-300",
    tailRegistration: "HS-TGB",
    airlineCode: "TG",
    seatCapacity: 299,
    seatConfig: [
      { cabin: "BUSINESS", seats: 24, basePriceMultiplier: 2.5 },
      { cabin: "ECONOMY", seats: 275, basePriceMultiplier: 1 },
    ],
  },
];

export function findAircraft(id: string): Aircraft | undefined {
  return MOCK_AIRCRAFT.find((a) => a.id === id);
}