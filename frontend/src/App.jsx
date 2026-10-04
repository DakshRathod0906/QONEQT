import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Create from './pages/Create'
import Blueprint from './pages/Blueprint'
import Studio from './pages/Studio'

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<Create />} />
          <Route path="/blueprint" element={<Blueprint />} />
          <Route path="/studio" element={<Studio />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App