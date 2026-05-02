// Simulated dynamic pricing engine for hotels.
// Adjusts nightly rates based on weekend (Thu/Fri/Sat in KSA) and seasonal/holiday peaks.

const HOLIDAY_RANGES: Array<{ from: string; to: string; label: string; mult: number }> = [
  { from: "12-20", to: "01-05", label: "Winter Holidays", mult: 1.4 },
  { from: "06-15", to: "08-31", label: "Summer Peak", mult: 1.25 },
  { from: "03-20", to: "04-10", label: "Eid / Spring Break", mult: 1.35 },
];

function inHolidayRange(d: Date): { mult: number; label: string } | null {
  const mmdd = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  for (const r of HOLIDAY_RANGES) {
    const wraps = r.from > r.to;
    const hit = wraps ? (mmdd >= r.from || mmdd <= r.to) : (mmdd >= r.from && mmdd <= r.to);
    if (hit) return { mult: r.mult, label: r.label };
  }
  return null;
}

export function getNightlyPrice(basePrice: number, date: Date): { price: number; reason: string | null; mult: number } {
  let mult = 1;
  let reason: string | null = null;
  const day = date.getDay(); // 0 Sun ... 4 Thu, 5 Fri, 6 Sat
  if (day === 4 || day === 5 || day === 6) { mult *= 1.25; reason = "weekend"; }
  const h = inHolidayRange(date);
  if (h) { mult *= h.mult; reason = reason ? `${reason}+holiday` : "holiday"; }
  return { price: Math.round(basePrice * mult), reason, mult };
}

export function calculateStayPrice(basePrice: number, checkIn: Date, checkOut: Date) {
  const nights: { date: Date; price: number; reason: string | null }[] = [];
  const cur = new Date(checkIn);
  while (cur < checkOut) {
    const n = getNightlyPrice(basePrice, cur);
    nights.push({ date: new Date(cur), price: n.price, reason: n.reason });
    cur.setDate(cur.getDate() + 1);
  }
  const total = nights.reduce((s, n) => s + n.price, 0);
  const baseTotal = basePrice * nights.length;
  const surge = total - baseTotal;
  const hasSurge = nights.some(n => n.reason);
  return { nights, total, baseTotal, surge, hasSurge };
}
