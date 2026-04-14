/**
 * Dinotes logo — notebook-shaped dino head with spiral binding and zigzag teeth.
 * Inspired by Notesaurus + Evernote: bold, iconic, clean at small sizes.
 */
export default function DinotesLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: 'rotate(-8deg)' }}
    >
      {/* Shadow */}
      <rect x="8" y="9" width="32" height="26" rx="3" fill="#1f2937" opacity="0.2" />

      {/* Notebook body (dino head shape) */}
      <rect x="10" y="6" width="30" height="26" rx="3" fill="#059669" stroke="#1f2937" strokeWidth="2.5" />

      {/* Jaw / chin extension */}
      <path
        d="M 10 28 L 10 34 Q 10 36 12 36 L 28 36 Q 30 36 30 34 L 30 28"
        fill="#059669"
        stroke="#1f2937"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Cover the seam between body and jaw */}
      <rect x="11.5" y="27" width="17" height="3" fill="#059669" />

      {/* Zigzag teeth line across the mouth */}
      <polyline
        points="12,28 15,31 18,28 21,31 24,28 27,31 29,28"
        fill="none"
        stroke="#1f2937"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Eye */}
      <circle cx="30" cy="15" r="4.5" fill="white" stroke="#1f2937" strokeWidth="2" />
      <circle cx="31" cy="14.5" r="2" fill="#1f2937" />
      {/* Eye highlight */}
      <circle cx="32" cy="13.5" r="0.8" fill="white" />

      {/* Nostril */}
      <circle cx="36" cy="21" r="1.2" fill="#047857" />

      {/* Brow ridge */}
      <path
        d="M 25 10 Q 28 8 34 10"
        fill="none"
        stroke="#1f2937"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Spiral binding (left edge) */}
      <circle cx="10" cy="11" r="2.2" fill="#f3f4f6" stroke="#1f2937" strokeWidth="1.5" />
      <circle cx="10" cy="18" r="2.2" fill="#f3f4f6" stroke="#1f2937" strokeWidth="1.5" />
      <circle cx="10" cy="25" r="2.2" fill="#f3f4f6" stroke="#1f2937" strokeWidth="1.5" />
    </svg>
  );
}
