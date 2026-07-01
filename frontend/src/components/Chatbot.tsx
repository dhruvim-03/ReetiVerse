import { useEffect, useMemo, useRef, useState } from 'react'
import { statesData } from '../data/statesData'
import './Chatbot.css'

type Msg = { role: 'user' | 'assistant'; content: string }

const allStateNames = Object.keys(statesData)
  .map(id => ({ id, name: statesData[id].name }))

function detectState(text: string): { id?: string; name?: string } {
  const t = text.toLowerCase()
  for (const s of allStateNames) {
    if (t.includes(s.name.toLowerCase()) || t.includes(s.id.replace(/_/g, ' '))) {
      return { id: s.id, name: s.name }
    }
  }
  return {}
}

async function wikiSummary(topic: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`)
    if (!res.ok) return undefined
    const j = await res.json()
    return j?.extract as string | undefined
  } catch {
    return undefined
  }
}

function buildAnswer(stateId?: string, query?: string): Promise<string> {
  const q = (query ?? '').trim()
  const s = stateId ? statesData[stateId] : undefined

  if (s) {
    // If the query asks about food, monuments, festivals, etc.
    const lowerQuery = q.toLowerCase()
    if (lowerQuery.includes('food') || lowerQuery.includes('cuisine') || lowerQuery.includes('eat')) {
      const items = s.foodCuisine?.items || []
      if (items.length) {
        return Promise.resolve(`Traditional cuisine of ${s.name} features: ${items.map(f => `${f.title} (${f.description})`).join('; ')}. Signature dishes include ${s.foodCuisine.signatureDishes || 'local recipes'}.`);
      }
    }
    if (lowerQuery.includes('monument') || lowerQuery.includes('place') || lowerQuery.includes('visit') || lowerQuery.includes('attraction')) {
      const items = s.tourismMonuments?.items || []
      if (items.length) {
        return Promise.resolve(`Famous sites to visit in ${s.name} include: ${items.map(m => `${m.title} (${m.description})`).join('; ')}. Notable landmarks: ${s.tourismMonuments.monuments || 'local heritage sites'}.`);
      }
    }
    if (lowerQuery.includes('festival') || lowerQuery.includes('celebrat')) {
      const items = s.festivals?.items || []
      if (items.length) {
        return Promise.resolve(`Vibrant celebrations in ${s.name} include: ${items.map(f => `${f.title} (${f.description})`).join('; ')}. Key festivals: ${s.festivals.majorFestivals || 'seasonal fairs'}.`);
      }
    }
    if (lowerQuery.includes('art') || lowerQuery.includes('craft') || lowerQuery.includes('dance') || lowerQuery.includes('music')) {
      const artItems = s.artCrafts?.items || []
      const musicItems = s.musicDance?.items || []
      const parts = []
      if (musicItems.length) parts.push(`Dance/Music: ${musicItems.map(d => `${d.title} (${d.description})`).join(', ')}`)
      if (artItems.length) parts.push(`Art/Handicrafts: ${artItems.map(a => `${a.title} (${a.description})`).join(', ')}`)
      if (parts.length) {
        return Promise.resolve(`Cultural performing arts and crafts of ${s.name}: ${parts.join('. ')}.`);
      }
    }
    
    // Default fallback state intro
    const parts: string[] = []
    parts.push(`${s.name}: ${s.description}`)
    if (s.tourismMonuments?.items?.length) parts.push(`Famous monuments: ${s.tourismMonuments.items.slice(0, 2).map(m => m.title).join(', ')}.`)
    if (s.foodCuisine?.items?.length) parts.push(`Signature foods: ${s.foodCuisine.items.slice(0, 2).map(f => f.title).join(', ')}.`)
    if (s.festivals?.items?.length) parts.push(`Major festivals: ${s.festivals.items.slice(0, 2).map(f => f.title).join(', ')}.`)
    
    return Promise.resolve(parts.join(' '))
  }

  const topic = q || 'India'
  return wikiSummary(topic).then(sum => sum ?? `I couldn't retrieve details for "${topic}". Ask about states (e.g. Rajasthan, Kerala) or cultural topics.`)
}

export default function Chatbot({ anchorStateId }: { anchorStateId?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Namaste! I am BharatGatha\'s cultural guide. Ask me about any Indian state, its heritage, foods, or festivals!' }
  ])
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  // Context-aware suggestion pills based on anchorStateId
  const suggestions = useMemo(() => {
    const s = anchorStateId ? statesData[anchorStateId] : undefined
    if (s) {
      return [
        `About ${s.name}`,
        `Foods in ${s.name}`,
        `Monuments of ${s.name}`,
        `Culture of ${s.name}`
      ]
    }
    return [
      'Tell me about Rajasthan',
      'Foods of Kerala',
      'Monuments in Delhi',
      'Festivals of Bengal'
    ]
  }, [anchorStateId])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isOpen])

  const send = async (text: string) => {
    const user = text.trim()
    if (!user) return
    setMessages(m => [...m, { role: 'user', content: user }])
    
    const detected = detectState(user)
    const sid = detected.id ?? anchorStateId
    
    const answer = await buildAnswer(sid, user)
    setMessages(m => [...m, { role: 'assistant', content: answer }])
  }

  return (
    <div className={`chatbot-widget ${isOpen ? 'active' : ''}`}>
      {/* Floating Toggle Bubble */}
      <button 
        className="chatbot-bubble-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        title="Ask Reetiverse AI"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Floating Chat Container Card */}
      {isOpen && (
        <div className="chatbot-card glass-panel anim-fade-in-up">
          <div className="chatbot-header">
            <div className="chatbot-title-block">
              <span className="bot-indicator">❖</span>
              <div>
                <div className="chatbot-title-text">ReetiAI</div>
                <div className="chatbot-title-status">Cultural Companion</div>
              </div>
            </div>
          </div>

          <div ref={listRef} className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-message ${m.role}`}>
                <div className="message-bubble">{m.content}</div>
              </div>
            ))}
          </div>

          <div className="chatbot-input-row">
            <input
              className="chatbot-input"
              placeholder="Ask about states, monuments, recipes..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { send(input); setInput('') } }}
            />
            <button className="chatbot-send" onClick={() => { send(input); setInput('') }}>
              Ask
            </button>
          </div>

          <div className="chatbot-suggestions">
            {suggestions.map((s, i) => (
              <button key={i} className="chatbot-suggestion" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
