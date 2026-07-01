import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()
  const [isExiting, setIsExiting] = useState(false)

  const handleEnter = () => {
    setIsExiting(true)
    // Wait for the exit animation to finish before navigating
    setTimeout(() => {
      navigate('/map')
    }, 800) // 800ms matches the fade-out duration
  }

  return (
    <div className={`landing-hero-container ${isExiting ? 'exit-active' : ''}`}>
      {/* Cinematic dark/gradient overlay to ensure text readability */}
      <div className="landing-overlay"></div>
      
      {/* Ornate corners for subtle cultural premium framing */}
      <div className="cinematic-frame">
        <div className="frame-corner top-left"></div>
        <div className="frame-corner top-right"></div>
        <div className="frame-corner bottom-left"></div>
        <div className="frame-corner bottom-right"></div>
      </div>

      <div className="landing-center-content">
        {/* Main Brand Title */}
        <h1 className="landing-title">REETIVERSE</h1>

        {/* Ornate micro divider */}
        <div className="landing-divider">
          <span className="divider-diamond">✦</span>
        </div>

        {/* Elegant two-line tagline */}
        <div className="landing-tagline">
          <span className="tagline-line line-1">Discover India's Stories</span>
          <span className="tagline-line line-2">Journey Through Its Soul</span>
        </div>

        {/* Mystical frosted glass pill Enter button */}
        <div className="landing-button-wrapper">
          <button className="landing-enter-btn" onClick={handleEnter}>
            <span className="btn-glow-effect"></span>
            <span className="btn-text">Enter</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
