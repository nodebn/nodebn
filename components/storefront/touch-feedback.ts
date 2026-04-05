import { cn } from "@/lib/utils";

/** Haptic-like press feedback for native <button> / clickable chips. */
export const pressable =
  "touch-manipulation select-none transition-transform duration-200 ease-out active:scale-[0.96] active:duration-100";

export function pressableClass(className?: string) {
  return cn(pressable, className);
}
