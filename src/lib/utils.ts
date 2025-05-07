import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PinataSDK } from "pinata"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const pinata = new PinataSDK({
  pinataJwt: "",
  pinataGateway: ""
})
