const TAG_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#eab308",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#ef4444",
  "#10b981",
  "#f59e0b",
];

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const intValue = parseInt(normalized, 16);
  const r = (intValue >> 16) & 255;
  const g = (intValue >> 8) & 255;
  const b = intValue & 255;
  return { r, g, b };
};

const withAlpha = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  const safeAlpha = clamp(alpha, 0, 1);
  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
};

export const getTagColor = (tag?: string) => {
  const safeTag = (tag || "").trim().toLowerCase();
  if (!safeTag) return TAG_COLORS[0];

  let hash = 0;
  for (let i = 0; i < safeTag.length; i += 1) {
    hash = safeTag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
};

export const getTagBadgeStyle = (tag?: string, tagColor?: string) => {
  const color = tagColor || getTagColor(tag);
  return {
    color,
    backgroundColor: withAlpha(color, 0.2),
    borderColor: withAlpha(color, 0.45),
  };
};