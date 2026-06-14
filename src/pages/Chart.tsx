import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createChart, LineStyle, CrosshairMode } from 'lightweight-charts'
import { useCandles, useMarkets } from '../hooks/useHyperliquid'
import { usePesoStore } from '../store'

const ALL_TF = [
  { label: '1m',  api: '1m' },
  { label: '3m',  api: '3m' },
  { label: '5m',  api: '5m' },
  { label: '15m', api: '15m' },
  { label: '30m', api: '30m' },
  { label: '1h',  api: '1h' },
  { label: '2h',  api: '2h' },
  { label: '4h',  api: '4h' },
  { label: '8h',  api: '8h' },
  { label: '12h', api: '12h' },
  { label: 'D',   api: '1d' },
  { label: '3D',  api: '3d' },
  { label: 'W',   api: '1w' },
  { label: 'M',   api: '1M' },
]

const DEFAULT_TF = ['1m', '5m', '15m', '1h', '4h', 'D', 'W']
const ORDER_TYPES = ['Buy', 'Sell', 'Limit', 'Stop', 'Stop Limit']
const LOT_OPTIONS = ['0.1', '0.2', '0.5', '0.7', '1.0', '2.0', '5.0']

export default function Chart() {
  const { symbol = 'BTC' } = useParams()
  const navigate = useNavigate()
  const prices = usePesoStore((s) => s.prices)

  const [activeTF, setActiveTF] = useState('15m')
  const [visibleTF, setVisibleTF] = useState<string[]>(DEFAULT_TF)
  const [showTFMenu, setShowTFMenu] = useState(false)
  const [tfMenuPos, setTfMenuPos] = useState({ bottom: 0, left: 0 })
  const [orderType, setOrderType] = useState('Buy')
  const [showOTMenu, setShowOTMenu] = useState(false)
  const [lot, setLot] = useState('0.7')
  const [slActive, setSlActive] = useState(false)
  const [tpActive, setTpActive] = useState(false)

  useMarkets()

  const chartContainerRef = useRef<HTMLDivElement>(null)
  const tfBtnRef = useRef<HTMLButtonElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const slLineRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tpLineRef = useRef<any>(null)

  const { candlesRef, version } = useCandles(symbol, activeTF)
  const currentPrice = prices[symbol] ?? 0

  // Init chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.offsetWidth,
      height: chartContainerRef.current.offsetHeight,
      layout: {
  background: { color: '#1B1B1D' },
  textColor: 'transparent',
  fontFamily: 'Inter, sans-serif',
  fontSize: 10,
},
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      // Crosshair visible seulement au touch/hover  
crosshair: {
  mode: CrosshairMode.Normal,
  vertLine: {
    color: '#4a5d6e',
    width: 1,
    style: LineStyle.Dashed,
    labelBackgroundColor: '#222328',
    labelVisible: true,
  },
  horzLine: {
    color: '#4a5d6e',
    width: 1,
    style: LineStyle.Dashed,
    labelBackgroundColor: '#222328',
    labelVisible: true,
  },
},
rightPriceScale: {
  visible: true,
  borderVisible: false,
  scaleMargins: { top: 0.08, bottom: 0.08 },
},
timeScale: {
  visible: true,
  borderVisible: false,
  timeVisible: true,
  secondsVisible: false,
},
    })

    const series = chart.addCandlestickSeries({
      upColor: '#2ebd85',
      downColor: '#f6465d',
      borderUpColor: '#2ebd85',
      borderDownColor: '#f6465d',
      wickUpColor: '#2ebd85',
      wickDownColor: '#f6465d',
      // Prix actuel en pointillé
      lastValueVisible: true,
      priceLineVisible: true,
      priceLineColor: '#2ebd85',
      priceLineWidth: 1,
      priceLineStyle: LineStyle.Dashed,
    })

    chartRef.current = chart
    seriesRef.current = series

    const ro = new ResizeObserver(() => {
      if (chartContainerRef.current)
        chart.resize(
          chartContainerRef.current.offsetWidth,
          chartContainerRef.current.offsetHeight
        )
    })
    ro.observe(chartContainerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
    }
  }, [])

  // Load candles
  useEffect(() => {
    if (!seriesRef.current || candlesRef.current.length === 0) return
    seriesRef.current.setData(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      candlesRef.current.map((c: any) => ({
        time: c.t,
        open: c.o,
        high: c.h,
        low: c.l,
        close: c.c,
      }))
    )
    if (version === 1) {
      chartRef.current?.timeScale().fitContent()
    }
  }, [version, candlesRef])

  // SL / TP lines
  useEffect(() => {
    if (!seriesRef.current || currentPrice === 0) return

    if (slLineRef.current) {
      seriesRef.current.removePriceLine(slLineRef.current)
      slLineRef.current = null
    }
    if (tpLineRef.current) {
      seriesRef.current.removePriceLine(tpLineRef.current)
      tpLineRef.current = null
    }

    if (slActive) {
      slLineRef.current = seriesRef.current.createPriceLine({
        price: currentPrice * 0.982,
        color: '#f6465d',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'SL',
      })
    }
    if (tpActive) {
      tpLineRef.current = seriesRef.current.createPriceLine({
        price: currentPrice * 1.025,
        color: '#2ebd85',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'TP',
      })
    }
  }, [slActive, tpActive, currentPrice])

  const isSell = orderType === 'Sell'

  return (
    <div style={{ height: '100vh', background: '#1B1B1D', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header ligne 1 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 14px 4px', flexShrink: 0 }}>
        <button onClick={() => navigate('/home')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
          Hyperliquid ⭐
        </div>
      </div>

      {/* Header ligne 2 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 14px 8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#f7931a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: '#fff' }}>₿</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{symbol}</span>
              <span style={{ background: '#2a2d32', color: '#9aabb8', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20 }}>40x</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--mu)' }}>Bitcoin</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: -0.6 }}>
            ${currentPrice > 0 ? currentPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '—'}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--g)' }}>Live</div>
        </div>
      </div>

      {/* Chart */}
      <div ref={chartContainerRef} style={{ flex: 1, minHeight: 0 }} />

      {/* TF bar */}
      <div style={{ display: 'flex', alignItems: 'center', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: '#1B1B1D', flexShrink: 0, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', padding: '5px 10px' }}>
          {ALL_TF.filter(t => visibleTF.includes(t.label)).map((t) => (
            <button key={t.label} onClick={() => setActiveTF(t.api)}
              style={{ padding: '5px 9px', fontSize: 12, fontWeight: 600, color: activeTF === t.api ? '#fff' : 'var(--mu)', background: activeTF === t.api ? '#2a2d35' : 'none', border: 'none', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {t.label}
            </button>
          ))}

          <button
            ref={tfBtnRef}
            onClick={() => {
              if (tfBtnRef.current) {
                const rect = tfBtnRef.current.getBoundingClientRect()
                setTfMenuPos({
                  bottom: window.innerHeight - rect.top + 6,
                  left: rect.left,
                })
              }
              setShowTFMenu(!showTFMenu)
            }}
            style={{ background: 'none', border: 'none', color: showTFMenu ? '#fff' : 'var(--mu)', fontSize: 16, fontWeight: 700, cursor: 'pointer', padding: '5px 6px', flexShrink: 0 }}>
            +
          </button>
        </div>

        {showTFMenu && (
          <>
            <div onClick={() => setShowTFMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
            <div style={{ position: 'fixed', bottom: tfMenuPos.bottom, left: tfMenuPos.left, width: 120, maxHeight: 280, overflowY: 'auto', background: '#222328', border: '1px solid var(--border)', borderRadius: 14, zIndex: 50, boxShadow: '0 -8px 30px rgba(0,0,0,.7)' }}>
              {ALL_TF.map((t) => {
                const isVisible = visibleTF.includes(t.label)
                const isActive = activeTF === t.api
                return (
                  <div key={t.label}
                    onClick={() => { setActiveTF(t.api); setShowTFMenu(false) }}
                    style={{ padding: '8px 12px', fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--g)' : '#fff', borderBottom: '1px solid #2a2a2f', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{t.label}</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        setVisibleTF(prev =>
                          isVisible ? prev.filter(x => x !== t.label) : [...prev, t.label]
                        )
                      }}
                      style={{ fontSize: 14, color: isVisible ? '#f5c542' : 'var(--mu)', padding: '2px 4px', cursor: 'pointer' }}>
                      {isVisible ? '★' : '☆'}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Exec zone */}
      <div style={{ padding: '9px 12px 18px', background: '#1B1B1D', flexShrink: 0, position: 'relative' }}>

        {showOTMenu && (
          <>
            <div onClick={() => setShowOTMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
            <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 12, width: 200, background: '#222328', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', zIndex: 50, boxShadow: '0 -12px 40px rgba(0,0,0,.7)' }}>
              {ORDER_TYPES.map((ot) => (
                <div key={ot} onClick={() => { setOrderType(ot); setShowOTMenu(false) }}
                  style={{ padding: '12px 16px', fontSize: 14, fontWeight: orderType === ot ? 700 : 500, color: orderType === ot ? 'var(--g)' : '#fff', borderBottom: '1px solid #2a2a2f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 14, display: 'inline-block' }}>{orderType === ot ? '✓' : ''}</span>
                  {ot}
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div onClick={() => setShowOTMenu(!showOTMenu)}
            style={{ flex: 1, height: 40, borderRadius: 22, display: 'flex', alignItems: 'center', padding: 3, cursor: 'pointer', background: isSell ? 'rgba(246,70,93,.15)' : 'rgba(46,189,133,.15)', border: `1.5px solid ${isSell ? 'rgba(246,70,93,.4)' : 'rgba(46,189,133,.4)'}` }}>
            <div style={{ width: 34, height: 34, borderRadius: 18, background: isSell ? 'var(--r)' : 'var(--g)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: isSell ? '#fff' : '#030f09', fontSize: 16 }}>{isSell ? '←' : '→'}</span>
            </div>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#fff', paddingRight: 4 }}>
              {orderType} {symbol}
            </div>
          </div>

          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <select value={lot} onChange={(e) => setLot(e.target.value)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', outline: 'none', appearance: 'none', WebkitAppearance: 'none', textAlign: 'center', width: 36 }}>
              {LOT_OPTIONS.map((l) => <option key={l} value={l} style={{ background: '#222328' }}>{l}</option>)}
            </select>
          </div>

          <button onClick={() => setSlActive(!slActive)}
            style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--r)', background: slActive ? 'var(--r)' : 'none', color: slActive ? '#fff' : 'var(--r)', fontSize: 11, fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>
            SL
          </button>

          <button onClick={() => setTpActive(!tpActive)}
            style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--g)', background: tpActive ? 'var(--g)' : 'none', color: tpActive ? '#030f09' : 'var(--g)', fontSize: 11, fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>
            TP
          </button>
        </div>
      </div>
    </div>
  )
}