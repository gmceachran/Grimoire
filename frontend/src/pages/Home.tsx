import React from 'react'

const Home: React.FC = () => {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-cyan-400 mb-5">Welcome to GRIMOIRE</h2>
      <p className="text-xl mb-8">Your React + PostgreSQL project is ready to go!</p>
      <div className="max-w-2xl mx-auto text-left">
        <h3 className="text-2xl font-semibold text-cyan-400 mb-4">Project Features:</h3>
        <ul className="space-y-2 text-lg">
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✅</span>
            React 18 with TypeScript
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✅</span>
            Vite for fast development
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✅</span>
            React Router for navigation
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✅</span>
            Axios for API calls
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✅</span>
            Tailwind CSS for styling
          </li>
          <li className="flex items-center">
            <span className="text-yellow-400 mr-2">🔄</span>
            Backend API (coming next)
          </li>
          <li className="flex items-center">
            <span className="text-yellow-400 mr-2">🔄</span>
            PostgreSQL database (coming next)
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Home
