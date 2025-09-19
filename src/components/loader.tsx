// Loader.tsx
export default function Loader() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.spinner}></div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',       // adjust height as needed
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '6px solid #e0e0e0',
    borderTop: '6px solid #4a90e2', // primary color
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// Inject a global keyframes rule for the spin animation
const styleEl = document.createElement('style');
styleEl.innerHTML = `
@keyframes spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
document.head.appendChild(styleEl);
