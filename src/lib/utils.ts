import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isDevUser(userId: string | null): boolean {
  const devUserId = process.env.NEXT_PUBLIC_DEV_USER_ID;
  return userId === devUserId;
}