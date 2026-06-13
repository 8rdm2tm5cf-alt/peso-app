import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Chart from './pages/Chart'
import History from './pages/History'
import Portfolio from './pages/Portfolio'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/chart/:symbol" element={<Chart />} />
      <Route path="/history" element={<History />} />
      <Route path="/portfolio" element={<Portfolio />} />
    </Routes>
  )
}

export default App