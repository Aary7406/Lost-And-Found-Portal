'use client';

export default function SkeletonLoader() {
  return (
    <div style={{
      width: '100%',
      height: '200px',
      background: 'linear-gradient(90deg, #1e1e2e 0%, #2a2a3e 50%, #1e1e2e 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: '12px'
    }}>
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
