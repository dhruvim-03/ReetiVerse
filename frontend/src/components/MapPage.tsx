import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MapIndia from './MapIndia'
import { statesData } from '../data/statesData'
import './MapPage.css'

interface StateItem {
  id: string;
  name: string;
  capital: string;
}

type Msg = { role: 'user' | 'assistant'; content: string }

// Extract all states sorted alphabetically
const allStates: StateItem[] = Object.keys(statesData)
  .map(id => ({
    id,
    name: statesData[id].name,
    capital: statesData[id].identity?.capital || ''
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

function detectState(text: string): { id?: string; name?: string } {
  const t = text.toLowerCase()
  for (const s of allStates) {
    if (t.includes(s.name.toLowerCase()) || t.includes(s.id.replace(/_/g, ' '))) {
      return { id: s.id, name: s.name }
    }
  }
  return {}
}

async function fetchWikiSummary(topic: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`)
    if (!res.ok) return undefined
    const j = await res.json()
    return j?.extract as string | undefined
  } catch {
    return undefined
  }
}

async function generateAIResponse(query: string): Promise<string> {
  const q = query.trim()
  const detected = detectState(q)
  const s = detected.id ? statesData[detected.id] : undefined

  if (s) {
    const lowerQuery = q.toLowerCase()
    if (lowerQuery.includes('food') || lowerQuery.includes('cuisine') || lowerQuery.includes('eat') || lowerQuery.includes('dish')) {
      const items = s.foodCuisine?.items || []
      const signature = s.foodCuisine?.signatureDishes
      if (items.length) {
        return `Traditional cuisine of ${s.name} is famous for ${signature || 'local flavors'}. Signature foods include: ${items.map(f => `**${f.title}** (${f.description})`).join('; ')}.`
      }
    }
    if (lowerQuery.includes('monument') || lowerQuery.includes('place') || lowerQuery.includes('visit') || lowerQuery.includes('attraction') || lowerQuery.includes('tourism')) {
      const items = s.tourismMonuments?.items || []
      const list = s.tourismMonuments?.monuments
      if (items.length) {
        return `Top places to explore in ${s.name} include ${list || 'monuments'}. Famous spots: ${items.map(m => `**${m.title}** (${m.description})`).join('; ')}.`
      }
    }
    if (lowerQuery.includes('festival') || lowerQuery.includes('celebrat') || lowerQuery.includes('fair')) {
      const items = s.festivals?.items || []
      const major = s.festivals?.majorFestivals
      if (items.length) {
        return `Vibrant cultural celebrations in ${s.name} include ${major || 'festivals'}. Key celebrations: ${items.map(f => `**${f.title}** (${f.description})`).join('; ')}.`
      }
    }
    if (lowerQuery.includes('art') || lowerQuery.includes('craft') || lowerQuery.includes('dance') || lowerQuery.includes('music') || lowerQuery.includes('handicraft')) {
      const artItems = s.artCrafts?.items || []
      const musicItems = s.musicDance?.items || []
      const parts = []
      if (musicItems.length) parts.push(`Performances: ${musicItems.map(d => `**${d.title}** (${d.description})`).join(', ')}`)
      if (artItems.length) parts.push(`Arts & Crafts: ${artItems.map(a => `**${a.title}** (${a.description})`).join(', ')}`)
      if (parts.length) {
        return `Performing arts and local crafts of ${s.name}: ${parts.join('. ')}.`
      }
    }
    let response = `**${s.name}** (Capital: *${s.identity?.capital || 'N/A'}*): ${s.description} `
    if (s.identity?.languages) response += `Primary languages: *${s.identity.languages}*. `
    return response
  }

  const sum = await fetchWikiSummary(q)
  if (sum) return sum

  return `I'm Reeti AI. I can tell you about heritage, traditional foods, monuments, and festivals of any Indian state. Try asking: *"Tell me about Rajasthan's culture"* or *"What is famous in Kerala?"*`
}

function MapPage() {
  const navigate = useNavigate()
  const [selectedStateId, setSelectedStateId] = useState<string>('rajasthan')
  
  // UI Overlays toggles to keep the main view clean and pixel-matched to the image
  const [isExplorerOpen, setIsExplorerOpen] = useState(false)
  const [isUtModalOpen, setIsUtModalOpen] = useState(false)
  const [isAiOpen, setIsAiOpen] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "Namaste! I am Reeti AI. Ask me about India's states, cuisines, monuments, or folk traditions!" }
  ])
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  
  const chatBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isAiOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isAiOpen])

  // Filter list
  const filteredStates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return allStates
    return allStates.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.capital.toLowerCase().includes(q) ||
      s.id.replace(/_/g, ' ').toLowerCase().includes(q)
    )
  }, [searchQuery])

  // Navigate to detailed state
  const handleSelectState = (stateId: string) => {
    setSelectedStateId(stateId)
    setIsExiting(true)
    setTimeout(() => {
      navigate(`/state/${stateId}`)
    }, 850) // exit delay matching page fade-out
  }

  const handleSendChat = async (text: string) => {
    const userText = text.trim()
    if (!userText) return
    setChatInput('')
    setMessages(prev => [...prev, { role: 'user', content: userText }])
    setIsAiTyping(true)

    try {
      const response = await generateAIResponse(userText)
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error. Please try again!" }])
    } finally {
      setIsAiTyping(false)
    }
  }

  const unionTerritoriesList = [
    { id: 'andaman_nicobar', name: 'Andaman & Nicobar' },
    { id: 'chandigarh', name: 'Chandigarh' },
    { id: 'dadra_nagar_haveli', name: 'Dadra & Nagar' },
    { id: 'delhi', name: 'Delhi (NCT)' },
    { id: 'jammu_kashmir', name: 'Jammu & Kashmir' },
    { id: 'ladakh', name: 'Ladakh' },
    { id: 'lakshadweep', name: 'Lakshadweep' },
    { id: 'puducherry', name: 'Puducherry' },
  ]

  const promptSuggestions = [
    "Tell me about Rajasthan's culture",
    "Which state has the highest literacy rate?",
    "Suggest hidden places in Northeast India",
    "Compare Kerala and Tamil Nadu"
  ]

  return (
    <div className={`ref-page-wrapper ${isExiting ? 'ref-exit-active' : ''}`}>
      {/* Dark overlay */}
      <div className="ref-page-overlay"></div>

      {/* 50/50 Split layout */}
      <main className="ref-page-layout">
        
        {/* LEFT COLUMN (≈50%): Interactive Map & Left Card Panel */}
        <section className="ref-left-column">

          {/* Top-Left Logo & Brand */}
          <div className="ref-brand-block" onClick={() => navigate('/')}>
            <svg viewBox="0 0 24 24" className="brand-logo-star">
              <path fill="#D6A85F" d="M12,2L14.4,9.6L22,12L14.4,14.4L12,22L9.6,14.4L2,12L9.6,9.6Z" />
              <circle cx="12" cy="12" r="2.5" fill="#1A0D08" />
              <path fill="#D6A85F" d="M12,10.5L13.5,12L12,13.5L10.5,12Z" />
            </svg>
            <h1 className="ref-brand-name">REETIVERSE</h1>
          </div>

          {/* Center Map of India */}
          <div className="ref-map-container">
            <MapIndia 
              selectedStateId={selectedStateId}
              onSelectState={handleSelectState}
            />
          </div>

          {/* Bottom-Left Vintage Compass */}
          <div className="ref-vintage-compass">
            <svg viewBox="0 0 100 100" className="compass-svg">
              <circle cx="50" cy="50" r="43" fill="none" stroke="#D6A85F" stroke-width="0.8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#D6A85F" stroke-dasharray="1 2.5" stroke-width="0.4" />
              <circle cx="50" cy="50" r="36" fill="none" stroke="#D6A85F" stroke-width="0.5" />
              
              {/* Point lines */}
              <line x1="50" y1="14" x2="50" y2="86" stroke="#D6A85F" stroke-width="0.5" />
              <line x1="14" y1="50" x2="86" y2="50" stroke="#D6A85F" stroke-width="0.5" />
              
              {/* Star points */}
              <polygon points="50,15 52.5,47.5 50,50 47.5,47.5" fill="#D6A85F" />
              <polygon points="50,85 52.5,52.5 50,50 47.5,52.5" fill="rgba(214, 168, 95, 0.4)" />
              <polygon points="15,50 47.5,47.5 50,50 47.5,52.5" fill="rgba(214, 168, 95, 0.4)" />
              <polygon points="85,50 52.5,47.5 50,50 52.5,52.5" fill="#D6A85F" />
              
              {/* Sub points */}
              <polygon points="50,50 71.2,28.8 54.2,45.8" fill="#D6A85F" />
              <polygon points="50,50 28.8,71.2 45.8,54.2" fill="rgba(214, 168, 95, 0.3)" />
              <polygon points="50,50 28.8,28.8 45.8,45.8" fill="rgba(214, 168, 95, 0.3)" />
              <polygon points="50,50 71.2,71.2 54.2,54.2" fill="#D6A85F" />
              
              <text x="50" y="10" font-family="'Cinzel', serif" font-size="7" fill="#D6A85F" text-anchor="middle">N</text>
              <text x="50" y="96" font-family="'Cinzel', serif" font-size="7" fill="#D6A85F" text-anchor="middle">S</text>
              <text x="7" y="52.5" font-family="'Cinzel', serif" font-size="7" fill="#D6A85F" text-anchor="middle">W</text>
              <text x="93" y="52.5" font-family="'Cinzel', serif" font-size="7" fill="#D6A85F" text-anchor="middle">E</text>
            </svg>
          </div>

        </section>

        {/* RIGHT COLUMN (≈50%): Stacked Ornate Panels */}
        <section className="ref-right-column">
          
          {/* Top Row: Side-by-side adjacent cards */}
          <div className="right-column-top-row">
            
            {/* Card 1: EXPLORE STATES */}
            <div className="ref-card explore-states-card ref-card--simplified">
              
              {/* Left Portion of Card 1 */}
              <div className="card-left-part">
                <div className="card-top-content">
                  <div className="heritage-icon-circle">
                    <svg viewBox="0 0 24 24" className="heritage-icon">
                      <path fill="#D6A85F" d="M12,2A3,3 0 0,0 9,5V7H15V5A3,3 0 0,0 12,2M8,8H16A1,1 0 0,1 17,9V21H7V9A1,1 0 0,1 8,8M10,12A2,2 0 0,0 8,14V20H16V14A2,2 0 0,0 14,12H10Z" />
                    </svg>
                  </div>
                  
                  <h2 className="card-heading">EXPLORE STATES</h2>
                  <div className="card-divider gold-divider"></div>
                  
                  <p className="card-description">
                    Discover the rich culture, heritage, traditions and stories of every Indian state.
                  </p>
                </div>
                
                <button className="pill-button gold-pill" onClick={() => setIsExplorerOpen(true)}>
                  Explore Now <span className="arrow">→</span>
                </button>
              </div>

            </div>

            {/* Card 2: UNION TERRITORIES */}
            <div className="ref-card union-territories-card ref-card--simplified">
              
              {/* Left Portion of Card 2 */}
              <div className="card-left-part">
                <div className="card-top-content">
                  <div className="heritage-icon-circle">
                    <svg viewBox="0 0 24 24" className="heritage-icon">
                      <path fill="#D6A85F" d="M12,2L2,22H22L12,2M12,6L18.8,18H5.2L12,6M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z" />
                    </svg>
                  </div>
                  
                  <h2 className="card-heading">UNION TERRITORIES</h2>
                  <div className="card-divider gold-divider"></div>
                  
                  <p className="card-description">
                    Explore the unique cultures, landscapes, and stories of India's Union Territories.
                  </p>
                </div>

                <button className="pill-button gold-pill" onClick={() => setIsUtModalOpen(true)}>
                  Explore Union Territories <span className="arrow">→</span>
                </button>
              </div>

            </div>

          </div>

          {/* Card 2: REETI AI */}
          <div className="ref-card reeti-ai-card">
            
            {/* Left Portion of Card 2 */}
            <div className="card-left-part">
              <div className="heritage-icon-circle purple-circle">
                <svg viewBox="0 0 24 24" className="heritage-icon purple-icon">
                  <path fill="#9B5CFF" d="M12,2L14.4,9.6L22,12L14.4,14.4L12,22L9.6,14.4L2,12L9.6,9.6Z" />
                </svg>
              </div>
              
              <h2 className="card-heading purple-heading">REETI AI</h2>
              <div className="card-divider purple-divider"></div>
              
              <p className="card-description">
                Your AI companion for everything about India. Ask, explore, learn and uncover endless stories.
              </p>
              
              <button className="pill-button purple-pill" onClick={() => setIsAiOpen(true)}>
                Ask Reeti AI <span className="arrow">→</span>
              </button>
            </div>

            {/* Right Portion: Animated Robot Assistant */}
            <div className="card-right-part robot-part">
              
              {/* Orbital Nodes & Neon lines background */}
              <div className="robot-orbitals-container">
                {/* Orbital lines */}
                <div className="orbit-line inner-orbit"></div>
                <div className="orbit-line outer-orbit"></div>
                
                {/* Glowing neon connecting lines (SVGs) */}
                <svg className="connecting-lines-svg" viewBox="0 0 100 100">
                  <line x1="20" y1="50" x2="50" y2="20" stroke="rgba(155, 92, 255, 0.4)" stroke-width="0.5" stroke-dasharray="2 2" />
                  <line x1="20" y1="50" x2="20" y2="80" stroke="rgba(155, 92, 255, 0.4)" stroke-width="0.5" />
                  <line x1="80" y1="50" x2="50" y2="20" stroke="rgba(155, 92, 255, 0.4)" stroke-width="0.5" />
                  <line x1="80" y1="50" x2="80" y2="80" stroke="rgba(155, 92, 255, 0.4)" stroke-width="0.5" stroke-dasharray="2 2" />
                </svg>
                
                {/* Floating UI Nodes with Icons */}
                <div className="floating-ui-node node-monument" onClick={() => handleSendChat("Suggest heritage monuments in India")}>
                  <span className="node-icon">🏛️</span>
                </div>
                <div className="floating-ui-node node-book" onClick={() => handleSendChat("Tell me about Indian literature")}>
                  <span className="node-icon">📖</span>
                </div>
                <div className="floating-ui-node node-chat" onClick={() => setIsAiOpen(true)}>
                  <span className="node-icon">💬</span>
                </div>
                <div className="floating-ui-node node-pin" onClick={() => handleSendChat("Which states have Unesco heritage sites?")}>
                  <span className="node-icon">📍</span>
                </div>

                {/* Cybernetic glowing dust particles */}
                <div className="particle particle-1"></div>
                <div className="particle particle-2"></div>
                <div className="particle particle-3"></div>
                <div className="particle particle-4"></div>
              </div>

              {/* Pure CSS/SVG Robot Component */}
              <div className="robot-svg-wrapper">
                <svg viewBox="0 0 200 240" className="robot-svg">
                  <g className="robot-breathing-group">
                    {/* Shadow glow under body */}
                    <ellipse cx="100" cy="225" rx="30" ry="6" fill="rgba(155, 92, 255, 0.25)" filter="blur(4px)" />
                    
                    {/* Body */}
                    <path d="M 64 165 C 64 150, 136 150, 136 165 L 126 215 L 74 215 Z" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2" />
                    {/* Chest center node */}
                    <circle cx="100" cy="188" r="15" fill="#18051f" stroke="#9b5cff" stroke-width="1.5" />
                    {/* Small inner chest temple silhouette */}
                    <path d="M 94 194 L 100 181 L 106 194 M 92 195 L 108 195" stroke="#c084fc" stroke-width="1.5" fill="none" />
                    
                    {/* Shoulders / Joint Caps */}
                    <circle cx="55" cy="172" r="7" fill="#cbd5e1" />
                    <circle cx="145" cy="172" r="7" fill="#cbd5e1" />

                    {/* Head Group */}
                    <g className="robot-head-group">
                      {/* Neck */}
                      <rect x="91" y="128" width="18" height="15" rx="4" fill="#cbd5e1" />
                      
                      {/* Head base */}
                      <rect x="55" y="62" width="90" height="74" rx="34" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" />
                      
                      {/* Glossy screen faceplate */}
                      <rect x="64" y="72" width="72" height="48" rx="18" fill="#0c0514" stroke="#25123d" stroke-width="1" />
                      
                      {/* Purple glowing eyes */}
                      <ellipse cx="84" cy="94" rx="7" ry="5.5" fill="#a855f7" className="robot-eye left-eye" />
                      <ellipse cx="116" cy="94" rx="7" ry="5.5" fill="#a855f7" className="robot-eye right-eye" />
                      
                      {/* Smile path */}
                      <path d="M 95 106 Q 100 110 105 106" fill="none" stroke="#a855f7" stroke-width="1.8" stroke-linecap="round" />
                      
                      {/* Side ears */}
                      <rect x="48" y="86" width="7" height="24" rx="3" fill="#cbd5e1" />
                      <rect x="145" y="86" width="7" height="24" rx="3" fill="#cbd5e1" />
                      <circle cx="51" cy="82" r="2.5" fill="#9b5cff" />
                      <circle cx="148" cy="82" r="2.5" fill="#9b5cff" />
                    </g>
                  </g>
                </svg>
              </div>

            </div>

          </div>

        </section>

      </main>

      {/* --- OVERLAY 1: States Explorer Drawer/Modal --- */}
      {isExplorerOpen && (
        <div className="ref-modal-overlay explorer-modal anim-fade-in" onClick={() => setIsExplorerOpen(false)}>
          <div className="ref-modal-card glass-panel" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setIsExplorerOpen(false)}>✕</button>
            <h3 className="modal-title">Explore Indian States</h3>
            
            <div className="modal-search-wrapper">
              <input
                type="text"
                className="modal-search-input"
                placeholder="Search state or capital..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="modal-scroll-list">
              {filteredStates.length > 0 ? (
                filteredStates.map(state => (
                  <div
                    key={state.id}
                    className={`modal-state-item ${selectedStateId === state.id ? 'active' : ''}`}
                    onClick={() => handleSelectState(state.id)}
                  >
                    <span className="bullet">❖</span>
                    <div className="state-details">
                      <span className="name">{state.name}</span>
                      <span className="capital">{state.capital}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-states">No matching states found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- OVERLAY 1.2: Union Territories Explorer Modal --- */}
      {isUtModalOpen && (
        <div className="ref-modal-overlay explorer-modal anim-fade-in" onClick={() => setIsUtModalOpen(false)}>
          <div className="ref-modal-card glass-panel" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setIsUtModalOpen(false)}>✕</button>
            <h3 className="modal-title">Explore Union Territories</h3>
            
            <div className="modal-scroll-list">
              {unionTerritoriesList.map(ut => (
                <div
                  key={ut.id}
                  className="modal-state-item"
                  onClick={() => handleSelectState(ut.id)}
                >
                  <span className="bullet">❖</span>
                  <div className="state-details">
                    <span className="name">{ut.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- OVERLAY 2: Reeti AI Chat Modal --- */}
      {isAiOpen && (
        <div className="ref-modal-overlay ai-modal anim-fade-in" onClick={() => setIsAiOpen(false)}>
          <div className="ref-modal-card ai-chat-card glass-panel" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setIsAiOpen(false)}>✕</button>
            
            <div className="ai-modal-header">
              <div className="mini-orb"></div>
              <div>
                <h3>Reeti AI Companion</h3>
                <p>Uncovering India's timeless stories</p>
              </div>
            </div>

            {/* Chat dialog messages */}
            <div className="ai-modal-messages">
              {messages.map((m, i) => (
                <div key={i} className={`modal-chat-bubble-row ${m.role}`}>
                  <div className="modal-chat-bubble">
                    {m.content.split('**').map((part, idx) => 
                      idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
                    )}
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className="modal-chat-bubble-row assistant">
                  <div className="modal-chat-bubble typing">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* suggestions */}
            <div className="modal-suggestions-row">
              {promptSuggestions.map((prompt, i) => (
                <button
                  key={i}
                  className="modal-suggestion-btn"
                  onClick={() => handleSendChat(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* chat input form */}
            <div className="modal-chat-input-row">
              <input
                type="text"
                className="modal-chat-input"
                placeholder="Ask about states, monuments, recipes..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSendChat(chatInput) }}
                autoFocus
              />
              <button className="modal-chat-send-btn" onClick={() => handleSendChat(chatInput)}>
                Ask
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default MapPage
