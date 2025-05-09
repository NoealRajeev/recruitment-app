import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/&/g, "") // Remove ampersand
    .replace(/[^a-z0-9\s-]/g, "") // Remove other special characters
    .replace(/\s+/g, "-"); // Replace spaces with hyphens
}
