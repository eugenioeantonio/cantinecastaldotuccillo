import { contact } from "@/lib/content";

/** Opening days, matching contact.hours ("Lun — Sab") and the JSON-LD. 0 = Sunday. */
const OPEN_DAYS = [1, 2, 3, 4, 5, 6];

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Daily windows parsed from contact.hours ("08:30 — 13:30"). */
const windows = contact.hours.map((h) => {
  const [open, close] = h.time.split("—").map((s) => s.trim());
  return { open, close, from: toMinutes(open), to: toMinutes(close) };
});

/** The cellar's local time, wherever the visitor is. */
function romeNow(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

/** One short, true line about whether the cellar is open right now. */
export function openingStatus(date = new Date()): string {
  const { day, minutes } = romeNow(date);
  const first = windows[0];

  if (OPEN_DAYS.includes(day)) {
    const current = windows.find((w) => minutes >= w.from && minutes < w.to);
    if (current) return `Aperto ora · fino alle ${current.close}`;
    const next = windows.find((w) => minutes < w.from);
    if (next) return `Chiuso · riapre alle ${next.open}`;
  }

  const tomorrow = (day + 1) % 7;
  if (OPEN_DAYS.includes(tomorrow)) return `Chiuso · domani dalle ${first.open}`;
  return `Chiuso · lunedì dalle ${first.open}`;
}
