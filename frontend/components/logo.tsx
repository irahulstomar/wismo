// Northbound wordmark + compass mark. The needle points north (brand) over a muted south —
// a small nod to "Northbound" and to wayfinding, reused on the storefront and dashboard.
export function CompassMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10.25" stroke="var(--brand)" strokeWidth="1.5" opacity="0.35" />
      <path d="M12 3.2 L14.6 12 L12 12 L9.4 12 Z" fill="var(--brand)" />
      <path d="M12 20.8 L9.4 12 L12 12 L14.6 12 Z" fill="var(--brand)" opacity="0.3" />
      <circle cx="12" cy="12" r="1.35" fill="var(--brand-fg)" stroke="var(--brand)" strokeWidth="1" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <CompassMark />
      {!compact && (
        <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
          Northbound<span className="font-medium text-ink-3"> Supply Co.</span>
        </span>
      )}
    </span>
  );
}
