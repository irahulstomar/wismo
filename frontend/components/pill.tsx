// Status label — a sharp-cornered, tinted "printed shipping label" (order status or
// conversation status). Letterspaced uppercase mono reads like stamped label ink.
// Colors come in as CSS-var strings, applied via inline style so the palette is never purged.
export function Pill({
  label,
  fg,
  bg,
}: {
  label: string;
  fg: string;
  bg: string;
}) {
  return (
    <span
      className="inline-flex items-center rounded-[3px] px-2 py-1 font-mono text-[10px] font-semibold uppercase leading-none tracking-wider whitespace-nowrap"
      style={{ color: fg, background: bg }}
    >
      {label}
    </span>
  );
}
