import { useNavigate } from 'react-router-dom'
import { useMarkets } from '../hooks/useHyperliquid'
import { usePesoStore } from '../store'

const MARKETS = [
  { symbol: 'BTC', name: 'Bitcoin',  color: '#f7931a', letter: '₿', vol: '7.80B', lev: 40 },
  { symbol: 'ETH', name: 'Ethereum', color: '#627eea', letter: 'Ξ', vol: '2.05B', lev: 25 },
  { symbol: 'HYPE', name: 'Hype',    color: '#0d9e8a', letter: 'H', vol: '1.23B', lev: 10 },
  { symbol: 'ZEC',  name: 'Zcash',   color: '#c8921a', letter: 'Z', vol: '976M',  lev: 10 },
]

export default function Home() {
  const navigate = useNavigate()
  const prices   = usePesoStore((s) => s.prices)
  const brokers  = usePesoStore((s) => s.brokers)
  useMarkets()

  const totalBalance = brokers.reduce((sum, b) => sum + b.balance, 0)

  return (
    <div style={{ height: '100vh', background: 'var(--bg)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px 10px' }}>
        <button onClick={() => navigate('/history')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>🕐</button>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Peso</span>
        <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>⚙️</button>
      </div>

      {/* Portfolio card */}
      <div onClick={() => navigate('/portfolio')} style={{ background: 'var(--card)', margin: '0 14px 10px', borderRadius: 18, padding: '15px 16px 14px', border: '1px solid var(--border)', cursor: 'pointer' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--mu)', marginBottom: 3 }}>Portfolio (USD) ›</div>
        <div style={{ fontSize: 33, fontWeight: 800, color: '#fff', letterSpacing: -1.5 }}>${totalBalance.toFixed(2)}</div>
        <div style={{ fontSize: 12, color: 'var(--mu)', marginBottom: 11 }}>$0.00 (+0.00%)</div>
        <div style={{ display: 'flex', gap: 7, marginBottom: 12, flexWrap: 'nowrap', alignItems: 'center' }}>
          {brokers.map((b) => (
            <div key={b.name} style={{ background: '#0f1214', border: '1px solid var(--border)', borderRadius: 20, padding: '5px 10px', fontSize: 11, fontWeight: 600, color: '#8a9ab0', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: b.color, flexShrink: 0, display: 'inline-block' }} />
              ${b.available.toFixed(2)} Available
            </div>
          ))}
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0f1214', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#8a9ab0', flexShrink: 0, cursor: 'pointer' }}>+1</div>
        </div>
        <button style={{ width: '100%', background: '#0f2318', border: '1.5px solid #1a4a2e', color: 'var(--g)', fontSize: 15, fontWeight: 700, padding: 12, borderRadius: 13, cursor: 'pointer' }}>
          Connect
        </button>
      </div>

      {/* Search */}
      <div style={{ margin: '0 14px 8px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', color: 'var(--mu)', fontSize: 13 }}>
        🔍 Search market
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 7, padding: '0 14px 10px', overflowX: 'auto' }}>
        {['⭐', 'Popular', 'New', 'Crypto', 'Stocks'].map((f) => (
          <div key={f} style={{ background: f === 'Popular' ? '#111d2e' : 'var(--card)', border: `1px solid ${f === 'Popular' ? '#2a4a72' : 'var(--border)'}`, borderRadius: 20, padding: '6px 15px', fontSize: 12, fontWeight: 600, color: f === 'Popular' ? '#6ea8e8' : 'var(--mu)', whiteSpace: 'nowrap', cursor: 'pointer' }}>
            {f}
          </div>
        ))}
      </div>

      {/* Sort row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px 7px' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '5px 11px', fontSize: 11, fontWeight: 600, color: '#8a9ab0', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#0d9e8a', display: 'inline-block' }} />
          All providers ▾
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '5px 11px', fontSize: 11, fontWeight: 600, color: '#8a9ab0' }}>
          Volume (24h) ↓
        </div>
      </div>

      {/* Market list */}
      <div style={{ padding: '0 14px 20px' }}>
        {MARKETS.map((m) => {
          const price = prices[m.symbol] ?? 0
          return (
            <div key={m.symbol} onClick={() => navigate(`/chart/${m.symbol}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 0', borderBottom: '1px solid #0e1012', cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                {m.letter}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{m.symbol}</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--mu)' }}>${m.vol} Vol · {m.lev}x</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  ${price > 0 ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--r)' }}>—</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}