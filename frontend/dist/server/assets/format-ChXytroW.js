import { parseISO, isValid, format } from "date-fns";
const formatPublished = (inputDate) => {
  if (!inputDate) return;
  try {
    const date = typeof inputDate === "string" ? parseISO(inputDate) : new Date(inputDate);
    if (!isValid(date)) {
      return "";
    }
    const formatted = format(date, "dd MMMM yyyy");
    return formatted;
  } catch (error) {
    const date = new Date(inputDate);
    if (isNaN(date.getTime())) {
      return "";
    }
    const formatted = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
    return formatted === "Invalid Date" ? "" : formatted;
  }
};
const getCurrencySymbol = (currencyCode) => {
  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    const formatted = formatter.format(0);
    const symbol = formatted.replace(/[0-9.,\s]/g, "");
    return symbol.trim();
  } catch (error) {
    console.error(`Error getting currency symbol for ${currencyCode}:`, error);
    return null;
  }
};
const timeAgo = (dateString, currentDate) => {
  if (!dateString) {
    return "";
  }
  if (!currentDate) {
    return "";
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.error("Invalid ISO 8601 date string provided:", dateString);
    return "";
  }
  const now = new Date(currentDate);
  const diffSeconds = (now.getTime() - date.getTime()) / 1e3;
  if (Math.abs(diffSeconds) < 60) {
    return "just now";
  }
  const units = [
    { unit: "year", seconds: 31536e3 },
    { unit: "month", seconds: 2592e3 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 }
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const { unit, seconds } of units) {
    const interval = diffSeconds / seconds;
    if (Math.abs(interval) >= 1) {
      return rtf.format(-Math.round(interval), unit);
    }
  }
  return rtf.format(-Math.round(diffSeconds), "second");
};
export {
  formatPublished as f,
  getCurrencySymbol as g,
  timeAgo as t
};
