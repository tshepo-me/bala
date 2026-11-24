/** Simple mark: a basket outline with a tally bar, in brand green. */
export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
      <rect x="2" y="2" width="28" height="28" rx="8" fill="#0b6e4f" />
      <path d="M8 13h16l-1.6 9.2a2 2 0 0 1-2 1.8H11.6a2 2 0 0 1-2-1.8L8 13Z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 13l2.5-5M20 13l-2.5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 17v4M16 17v4M19 17v4" stroke="#f4a300" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
