"use client";

import { useRouter } from "next/navigation";
import { Plane } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * /booking without a flightId — redirect to search.
 */
export default function BookingIndexPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-aviation-900/5 text-aviation-900">
        <Plane className="h-8 w-8 -rotate-45" />
      </span>
      <h1 className="font-display text-xl font-bold text-slate-900">
        Select a flight to book
      </h1>
      <p className="max-w-sm text-center text-sm text-slate-500">
        To start booking, search for available flights and select the one you&apos;d like to fly.
      </p>
      <Button variant="cta" onClick={() => router.push("/flights")}>
        Search flights
      </Button>
    </div>
  );
}