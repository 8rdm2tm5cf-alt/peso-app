import { useEffect, useRef, useState } from 'react'
import { fetchCandles, fetchMarkets } from '../services/hyperliquid'
import { usePesoStore } from '../store'

export function useMarkets() {
  const setPrice = usePesoStore((s) => s.setPrice)

  useEffect(() => {
    const load = async () => {
      try {
        const markets = await fetchMarkets()
        markets.forEach((m: { symbol: string; price: number }) => {
          setPrice(m.symbol, m.price)
        })
      } catch (e) {
        console.error('fetchMarkets error', e)
      }
    }
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [setPrice])
}

export function useCandles(symbol: string, interval: string) {
  const candlesRef = useRef<{ t: number; o: number; h: number; l: number; c: number }[]>([])
  const [version, setVersion] = useState(0)

  useEffect(() => {
    candlesRef.current = []
    let cancelled = false

    const load = async () => {
      try {
        const data = await fetchCandles(symbol, interval, 300)
        if (!cancelled) {
          candlesRef.current = data
          setVersion((v) => v + 1)
        }
      } catch (e) {
        console.error('fetchCandles error', e)
      }
    }

    load()
    const timer = setInterval(load, 10000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [symbol, interval])

  return { candlesRef, version }
}