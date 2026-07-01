import { Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import MapPage from './components/MapPage'
import StateDetailPage from './components/StateDetailPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/state/:stateId" element={<StateDetailPage />} />
    </Routes>
  )
}

export default App


