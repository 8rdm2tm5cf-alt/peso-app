const HL_API = 'https://api.hyperliquid.xyz/info'

export async function fetchCandles(
  symbol: string,
  interval: string,
  limit = 150
): Promise<{ t: number; o: number; h: number; l: number; c: number }[]> {
  const now = Date.now()
  const intervalMs: Record<string, number> = {
    '1m': 60000, '5m': 300000, '15m': 900000,
    '1H': 3600000, '1D': 86400000, '1W': 604800000,
  }
  const ms = intervalMs[interval] || 900000
  const startTime = now - limit * ms

  const res = await fetch(HL_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'candleSnapshot',
      req: { coin: symbol, interval, startTime, endTime: now },
    }),
  })

  const data = await res.json()

return data.map((c: Record<string, string>) => ({
  t: Math.floor(Number(c.t) / 1000),
  o: parseFloat(c.o),
  h: parseFloat(c.h),
  l: parseFloat(c.l),
  c: parseFloat(c.c),
}))
}

export async function fetchMarkets() {
  const res = await fetch(HL_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'metaAndAssetCtxs' }),
  })
  const [meta, ctxs] = await res.json()
  return meta.universe.map((asset: Record<string, unknown>, i: number) => ({
    symbol: asset.name,
    price: parseFloat(ctxs[i]?.markPx || '0'),
    change24h: 0,
    volume: parseFloat(ctxs[i]?.dayNtlVlm || '0'),
    maxLeverage: asset.maxLeverage,
  }))
}