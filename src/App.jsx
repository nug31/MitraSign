import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Verification from './pages/Verification'

function App() {
    return (
        <Router>
            <div className="min-h-screen">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/verify" element={<Verification />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App
