import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as a euro amount, e.g. 11.5 -> "€11.50". */
export function euro(n: number): string {
  return `€${n.toFixed(2)}`;
}

/** Format a Date as HH:MM (24h). */
export function hhmm(d: Date): string {
  return d.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
