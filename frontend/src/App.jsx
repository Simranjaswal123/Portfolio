import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Skills from './components/Skills.jsx'
import Experience from './components/Experience.jsx'
import Education from './components/Education.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

// The public portfolio: the same components, in the same order, as before.
function PublicPortfolio() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Home />
      <Experience />
      <Education />
      <Contact />
      <Footer />
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicPortfolio />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
