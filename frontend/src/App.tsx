/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AiCore from './pages/AiCore';
import VoiceAssistant from './pages/VoiceAssistant';

import KrishnaLearn from './pages/KrishnaLearn';
import KrishnaGuardian from './pages/KrishnaGuardian';
import AboutCreator from './pages/AboutCreator';
import UlosUniversalLife from './pages/UlosUniversalLife';
import NeuralCanvas from './pages/NeuralCanvas';
import KrishnaVision from './pages/KrishnaVision';
import KrishnaAgent from './pages/KrishnaAgent';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import ResetPassword from './pages/ResetPassword';
import KrishnaBrainBot from './components/KrishnaBrainBot';
import { QuickTaskModal } from './components/QuickTaskModal';
import { CommandPalette } from './components/CommandPalette';
import { MouseGestureController } from './components/MouseGestureController';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useSystemStore } from './store/system';

function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { zenMode } = useSystemStore();

  return (
    <div className={`flex h-screen w-full overflow-hidden bg-krishna-bg text-white font-sans selection:bg-krishna-cyan selection:text-black ${zenMode ? 'zen-mode-active' : ''}`}>
      {!isHome && !zenMode && <Sidebar />}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Subtle background neural grid */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.05)_0%,#02040A_70%)] pointer-events-none"></div>
        <div className="absolute inset-0 z-0" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.2 }}></div>
        
        {!isHome && <Header />}
        <main className={isHome ? "flex-1 overflow-y-auto z-10" : "flex-1 overflow-y-auto z-10 p-4 md:p-8"}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/core" element={<ProtectedRoute><AiCore /></ProtectedRoute>} />
            <Route path="/vision" element={<ProtectedRoute><KrishnaVision /></ProtectedRoute>} />
            <Route path="/agent" element={<ProtectedRoute><KrishnaAgent /></ProtectedRoute>} />
            <Route path="/voice" element={<ProtectedRoute><VoiceAssistant /></ProtectedRoute>} />
            <Route path="/learn" element={<ProtectedRoute><KrishnaLearn /></ProtectedRoute>} />

            <Route path="/guardian" element={<ProtectedRoute><KrishnaGuardian /></ProtectedRoute>} />
            <Route path="/creator" element={<AboutCreator />} />
            <Route path="/ulos" element={<ProtectedRoute><UlosUniversalLife /></ProtectedRoute>} />
            <Route path="/canvas" element={<ProtectedRoute><NeuralCanvas /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        {/* Global Brain Help Bot (Accessible across all contexts) */}
        <KrishnaBrainBot />

        {/* Global Quick Task Modal */}
        <QuickTaskModal />

        {/* Global Command Palette */}
        <CommandPalette />

        {/* Global Mouse Gesture Controller */}
        <MouseGestureController />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

