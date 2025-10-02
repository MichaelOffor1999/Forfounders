import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import apiRequest from "./api.js"
import Login from "./pages/login.jsx"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from "./ProtectedRoute"
import { Dashboard } from './pages/Dashboard.jsx'
import { Discovery } from "./pages/Discovery.jsx"
import { Register } from "./pages/Register" 
import Onboarding from "./pages/Onboarding"
import WaveRequests from "./pages/WaveRequests.jsx";
import Messages from "./pages/Messages.jsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />} />
        <Route 
          path="/app" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/discover" 
          element={
            <ProtectedRoute>
              <Discovery />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route 
          path="/wave-requests" 
          element={
            <ProtectedRoute>
              <WaveRequests />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
      </Routes>
  </BrowserRouter>
  );
}

export default App

