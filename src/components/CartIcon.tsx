type CartIconProps = {
  className?: string;
};

export function CartIcon({ className }: CartIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M3 4h2.2l1.6 10.2a2 2 0 0 0 2 1.7h7.8a2 2 0 0 0 2-1.6L20 7H6" />
      <circle cx="9.5" cy="19.5" r="1.4" />
      <circle cx="17.5" cy="19.5" r="1.4" />
    </svg>
  );
}
