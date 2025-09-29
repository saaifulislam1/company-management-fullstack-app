import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatDuration = (hoursDecimal: number): string => {
  if (isNaN(hoursDecimal) || hoursDecimal < 0) {
    return "0 minutes";
  }

  const totalMinutes = Math.round(hoursDecimal * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const parts = [];
  if (hours > 0) {
    parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  }

  return parts.length > 0 ? parts.join(" ") : "0 minutes";
};
