"use client";

// Storefront CTA that opens the floating chat widget (decoupled via a window event).
export function OpenChatButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("northbound:open-chat"))}
      className={className}
    >
      {children}
    </button>
  );
}
