export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function decodeHtml(str) {
  if (!str) return "";
  const el = document.createElement("textarea");
  el.innerHTML = str;
  return el.value;
}
