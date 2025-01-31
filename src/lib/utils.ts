import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generatePaginationNUmbers = (delta: number, currentPage: number, totalPages: number) => {
  const range: (number | string)[] = [];

  range.push(1);

  if (currentPage > delta + 2) {
    range.push("...");
  }

  // Calculate start and end of range around current page
  const rangeStart = Math.max(2, currentPage - delta);
  const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

  for (let i = rangeStart; i <= rangeEnd; i++) {
    if (i !== 1 && i !== totalPages) {
      range.push(i);
    }
  }

  if (currentPage < totalPages - (delta + 1)) {
    range.push("...");
  }

  // Always show last page
  if (totalPages > 1) {
    range.push(totalPages);
  }

  return range;
};
