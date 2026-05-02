export function formatINR(value?: number | null) {
  if (value == null) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function priceRange(min?: number | null, max?: number | null) {
  if (min == null && max == null) return "Price on request";
  if (min != null && max != null && min !== max) return `${formatINR(min)} – ${formatINR(max)}`;
  return formatINR(min ?? max ?? 0);
}
