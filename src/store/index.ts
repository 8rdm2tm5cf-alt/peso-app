import { create } from 'zustand'

interface Position {
  symbol: string
  side: 'buy' | 'sell'
  size: number
  entryPrice: number
  pnl: number
}

interface Broker {
  name: string
  balance: number
  available: number
  color: string
}

interface PesoStore {
  // Brokers
  brokers: Broker[]
  activeBroker: string
  setActiveBroker: (name: string) => void

  // Prix live
  prices: Record<string, number>
  setPrice: (symbol: string, price: number) => void

  // Positions
  positions: Position[]
  setPositions: (positions: Position[]) => void

  // Symbole actif sur le chart
  activeSymbol: string
  setActiveSymbol: (symbol: string) => void
}

export const usePesoStore = create<PesoStore>((set) => ({
  brokers: [
    { name: 'Hyperliquid', balance: 849.99, available: 849.99, color: '#0d9e8a' },
  ],
  activeBroker: 'Hyperliquid',
  setActiveBroker: (name) => set({ activeBroker: name }),

  prices: { BTC: 61177, ETH: 1580, HYPE: 60.22, ZEC: 372 },
  setPrice: (symbol, price) =>
    set((state) => ({ prices: { ...state.prices, [symbol]: price } })),

  positions: [],
  setPositions: (positions) => set({ positions }),

  activeSymbol: 'BTC',
  setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),
}))