export default function TokenBalance({ balance }: { balance: number }) {
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '10px',
      zIndex: 1000,
    }}>
      <h2>MOBX Balance</h2>
      <p style={{ fontSize: '24px', margin: 0 }}>{balance}</p>
    </div>
  );
}
