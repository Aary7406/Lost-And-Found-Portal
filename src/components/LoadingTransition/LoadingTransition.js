'use client';

export default function LoadingTransition({ isLoading }) {
  if (!isLoading) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(17, 17, 27, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9998
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid rgba(203, 166, 247, 0.2)',
        borderTop: '4px solid #cba6f7',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
