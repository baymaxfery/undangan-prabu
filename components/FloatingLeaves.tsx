'use client';

const LEAVES = [
  { left: '5%', delay: '0s', fallDuration: '9s', swayDuration: '2.5s', size: 22, color: '#6b9e78' },
  { left: '15%', delay: '2s', fallDuration: '11s', swayDuration: '3.2s', size: 16, color: '#8ab88e' },
  { left: '26%', delay: '4s', fallDuration: '8.5s', swayDuration: '2.8s', size: 20, color: '#4a7c59' },
  { left: '38%', delay: '1s', fallDuration: '12s', swayDuration: '3.5s', size: 24, color: '#74a57f' },
  { left: '48%', delay: '5s', fallDuration: '9.5s', swayDuration: '2.6s', size: 18, color: '#9cc59a' },
  { left: '59%', delay: '0.5s', fallDuration: '10.5s', swayDuration: '3s', size: 21, color: '#5c8d6b' },
  { left: '70%', delay: '3s', fallDuration: '8s', swayDuration: '2.4s', size: 17, color: '#8ab88e' },
  { left: '81%', delay: '6s', fallDuration: '11.5s', swayDuration: '3.4s', size: 23, color: '#4a7c59' },
  { left: '91%', delay: '1.5s', fallDuration: '9s', swayDuration: '2.7s', size: 19, color: '#6b9e78' },
  { left: '32%', delay: '7s', fallDuration: '10s', swayDuration: '3.1s', size: 15, color: '#9cc59a' },
];

export default function FloatingLeaves({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div
      className={
        fullScreen
          ? 'fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-none overflow-hidden z-[60]'
          : 'absolute inset-0 pointer-events-none overflow-hidden z-20'
      }
    >
      {LEAVES.map((leaf, i) => (
        <div
          key={i}
          className="animate-leaf-fall absolute -top-10"
          style={{
            left: leaf.left,
            animationDelay: leaf.delay,
            animationDuration: leaf.fallDuration,
          }}
        >
          <div
            className="animate-leaf-sway"
            style={{
              animationDuration: leaf.swayDuration,
              animationDelay: leaf.delay,
            }}
          >
            {/* Gambar Ikon Daun */}
            <svg
              width={leaf.size}
              height={leaf.size}
              viewBox="0 0 24 24"
              fill={leaf.color}
              className="opacity-80 drop-shadow-sm"
            >
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}