import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 p-5 border-b border-gray-700">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">GRIMOIRE</h1>
          <nav>
            <a href="/" className="text-cyan-400 hover:underline text-lg mx-4">Home</a>
          </nav>
        </header>
        <main className="p-10">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
