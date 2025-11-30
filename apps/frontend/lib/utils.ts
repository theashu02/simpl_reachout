import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const dmSans = '"DM Sans", "Inter", system-ui, sans-serif';
export const LogoURL = "https://res.cloudinary.com/dntxrtlsj/image/upload/v1764534180/Simplx_o6gwi2.png"