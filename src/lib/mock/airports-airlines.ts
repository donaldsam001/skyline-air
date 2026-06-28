import { Airline, Airport } from "@/types";

export const MOCK_AIRPORTS: Airport[] = [
  { id: "ap-1", iataCode: "SGN", name: "Tan Son Nhat International", city: "Ho Chi Minh City", country: "Vietnam", latitude: 10.8188, longitude: 106.652 },
  { id: "ap-2", iataCode: "HAN", name: "Noi Bai International", city: "Hanoi", country: "Vietnam", latitude: 21.2212, longitude: 105.807 },
  { id: "ap-3", iataCode: "DAD", name: "Da Nang International", city: "Da Nang", country: "Vietnam", latitude: 16.0439, longitude: 108.199 },
  { id: "ap-4", iataCode: "SIN", name: "Changi Airport", city: "Singapore", country: "Singapore", latitude: 1.3644, longitude: 103.9915 },
  { id: "ap-5", iataCode: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand", latitude: 13.69, longitude: 100.7501 },
  { id: "ap-6", iataCode: "NRT", name: "Narita International", city: "Tokyo", country: "Japan", latitude: 35.7647, longitude: 140.3863 },
  { id: "ap-7", iataCode: "ICN", name: "Incheon International", city: "Seoul", country: "South Korea", latitude: 37.4602, longitude: 126.4407 },
  { id: "ap-8", iataCode: "SYD", name: "Kingsford Smith Airport", city: "Sydney", country: "Australia", latitude: -33.9399, longitude: 151.1753 },
  { id: "ap-9", iataCode: "LHR", name: "Heathrow Airport", city: "London", country: "United Kingdom", latitude: 51.47, longitude: -0.4543 },
  { id: "ap-10", iataCode: "DXB", name: "Dubai International", city: "Dubai", country: "UAE", latitude: 25.2532, longitude: 55.3657 },
];

export const MOCK_AIRLINES: Airline[] = [
  { id: "al-1", iataCarrierCode: "VN", operatorName: "Skyline Vietnam Airlines", email: "ops@skylinevn.com", phone: "+84 28 3832 0320", logoColor: "#0B3D91" },
  { id: "al-2", iataCarrierCode: "VJ", operatorName: "Skyline Express", email: "ops@skylineexpress.com", phone: "+84 28 7300 0918", logoColor: "#F59E0B" },
  { id: "al-3", iataCarrierCode: "SQ", operatorName: "Stellar Air Singapore", email: "contact@stellarair.sg", phone: "+65 6223 8888", logoColor: "#0EA5E9" },
  { id: "al-4", iataCarrierCode: "TG", operatorName: "Siam Pacific Airways", email: "support@siampacific.co.th", phone: "+66 2 545 1000", logoColor: "#7C3AED" },
];

export function findAirport(iataCode: string): Airport | undefined {
  return MOCK_AIRPORTS.find((a) => a.iataCode === iataCode);
}

export function findAirline(code: string): Airline | undefined {
  return MOCK_AIRLINES.find((a) => a.iataCarrierCode === code);
}