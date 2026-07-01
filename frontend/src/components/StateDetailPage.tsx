import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { statesData, StateDetails } from '../data/statesData'
import './StateDetailPage.css'
import StateCard from './StateCard'
import Chatbot from './Chatbot'

// Curated high-resolution Unsplash photo links for all 36 States & UTs (representing landmarks and landscape view)
const stateImages: Record<string, string[]> = {
  rajasthan: [
    'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=800&auto=format&fit=crop', // Hawa Mahal
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1627894483216-2138af692e32?q=80&w=800&auto=format&fit=crop'
  ],
  kerala: [
    'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800&auto=format&fit=crop', // Backwaters
    'https://images.unsplash.com/photo-1615469038759-3b56a656a877?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop'
  ],
  tamil_nadu: [
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop', // Temple
    'https://images.unsplash.com/photo-1600256698643-1d834a64ef81?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800&auto=format&fit=crop'
  ],
  punjab: [
    'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?q=80&w=800&auto=format&fit=crop', // Golden Temple
    'https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?q=80&w=800&auto=format&fit=crop'
  ],
  uttar_pradesh: [
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800&auto=format&fit=crop', // Taj Mahal
    'https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=800&auto=format&fit=crop'
  ],
  delhi: [
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop', // India Gate
    'https://images.unsplash.com/photo-1506461883276-594a12b11cc3?q=80&w=800&auto=format&fit=crop'
  ],
  ladakh: [
    'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop', // Pangong Lake
    'https://images.unsplash.com/photo-1545124445-5fbe6089339a?q=80&w=800&auto=format&fit=crop'
  ]
}

const fallbackImages = [
  'https://images.unsplash.com/photo-1545124445-5fbe6089339a?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600256698643-1d834a64ef81?q=80&w=800&auto=format&fit=crop'
]

// State-specific mottos / taglines
const stateMottos: Record<string, string> = {
  rajasthan: 'Land of desert castles and heritage legends',
  kerala: 'God’s own country of backwaters and spice hills',
  tamil_nadu: 'Cradle of ancient Dravidian temples and classical arts',
  punjab: 'Granary of India, land of five rivers and vibrant energy',
  uttar_pradesh: 'Heartland of Indian civilization, heritage, and spirituality',
  delhi: 'Cinematic capital of monuments, history, and modern life',
  ladakh: 'High-altitude cold desert of lakes, monasteries, and peaks'
}

interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
}

const categoriesList: CategoryConfig[] = [
  { id: 'history', name: 'History', icon: '📜' },
  { id: 'culture', name: 'Culture & Traditions', icon: '🎭' },
  { id: 'places', name: 'Famous Places', icon: '🏛️' },
  { id: 'food', name: 'Food & Cuisine', icon: '🍛' },
  { id: 'festivals', name: 'Festivals', icon: '🏮' },
  { id: 'art', name: 'Art & Handicrafts', icon: '🎨' },
  { id: 'geography', name: 'Geography & Climate', icon: '🌍' },
  { id: 'economy', name: 'Economy & Industries', icon: '💼' },
  { id: 'education', name: 'Education', icon: '🎓' },
  { id: 'languages', name: 'Languages', icon: '🗣️' },
  { id: 'transport', name: 'Transportation', icon: '🚂' }
]

interface CategorySection {
  title: string;
  icon: string;
  content: React.ReactNode;
}

function StateDetailPage() {
  const { stateId } = useParams<{ stateId: string }>()
  const navigate = useNavigate()

  // Selection & transitions states
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [isDetailFading, setIsDetailFading] = useState(false)
  const [wikiThumbnail, setWikiThumbnail] = useState<string>('')
  const [weather, setWeather] = useState<{ temp?: number; desc?: string } | null>(null)
  
  // Interactive component states

  const formatName = (id: string) => id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  const buildFallback = (id: string): StateDetails => {
    const name = formatName(id)
    return {
      name,
      description: `${name} is an integral state in India, celebrated for its rich culture, traditional communities, and geographic landmarks.`,
      identity: {
        capital: "N/A",
        formationDay: "N/A",
        region: "N/A",
        area: "N/A",
        population: "N/A",
        languages: "N/A"
      },
      geography: {
        summary: `The geography of ${name} represents a unique combination of local borders, river systems, and forest covers.`,
        items: []
      },
      history: {
        summary: `The history of ${name} is a chronicle of ancient kingdoms, local empires, and contribution to India's freedom struggle.`,
        items: []
      },
      culture: {
        summary: `${name} displays heritage traditions, local attire, crafts, and performing arts.`,
        items: []
      },
      languageLiterature: {
        summary: `Language links oral traditions and folk literature in ${name}.`,
        items: []
      },
      festivals: {
        summary: `Festivals in ${name} show deep spiritual devotion and local community spirit.`,
        items: []
      },
      artCrafts: {
        summary: `Folk crafts in ${name} represent generations of fine craftsmanship passed down in guilds.`,
        items: []
      },
      musicDance: {
        summary: `Music and dance are deep-rooted folk expressions of the land.`,
        items: []
      },
      foodCuisine: {
        summary: `The cuisine of ${name} is a flavorful journey shaped by agricultural yields.`,
        items: []
      },
      tourismMonuments: {
        summary: `Tourism in ${name} offers tours through ancient shrines and scenic vistas.`,
        items: []
      },
      peopleSociety: {
        summary: `Society in ${name} is a blend of diverse communities.`,
        items: []
      },
      economyIndustries: {
        summary: `The economy of ${name} is powered by services, agriculture, and local handlooms.`,
        items: []
      },
      educationInnovation: {
        summary: `Education in ${name} is supported by major state institutions.`,
        items: []
      },
      sportsRecreation: {
        summary: `Sports culture in ${name} is a mix of traditional games.`,
        items: []
      },
      famousPersonalities: {
        summary: `Visionary thinkers and brave rulers have shaped the state's cultural landscape.`,
        items: []
      },
      uniqueFacts: {
        summary: `Interesting trivia and records associated with ${name}.`,
        symbols: {
          animal: "State Animal",
          bird: "State Bird",
          tree: "State Tree",
          flower: "State Flower"
        },
        items: []
      }
    }
  }

  const getMergedState = (stateIdStr?: string): StateDetails => {
    const fallback = stateIdStr ? buildFallback(stateIdStr) : buildFallback('india')
    const custom = stateIdStr ? statesData[stateIdStr] : undefined
    if (custom) {
      return {
        ...fallback,
        ...custom
      }
    }
    return fallback
  }

  const resolved = useMemo(() => getMergedState(stateId), [stateId])

  const stateTagline = useMemo(() => {
    return stateMottos[stateId || ''] || 'A mystical land of heritage and traditions'
  }, [stateId])

  // Get active cover image representing the state
  const activeCoverImage = useMemo(() => {
    if (wikiThumbnail) return wikiThumbnail
    const list = stateImages[stateId || ''] || fallbackImages
    return list[0]
  }, [stateId, wikiThumbnail])

  // Fetch Wikipedia Cover Thumbnail & weather forecast
  useEffect(() => {
    if (!stateId) return
    let active = true

    const loadWiki = async () => {
      try {
        const resolvedName = resolved.name
        const cached = sessionStorage.getItem(`wiki_summary_${stateId}`)
        if (cached) {
          const data = JSON.parse(cached)
          if (data.originalimage?.source) {
            setWikiThumbnail(data.originalimage.source)
          }
          return
        }
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(resolvedName)}`)
        if (res.ok && active) {
          const data = await res.json()
          sessionStorage.setItem(`wiki_summary_${stateId}`, JSON.stringify(data))
          if (data.originalimage?.source) {
            setWikiThumbnail(data.originalimage.source)
          }
        }
      } catch {}
    }

    const loadWeather = async () => {
      try {
        const q = encodeURIComponent(resolved.name)
        const cachedGeo = sessionStorage.getItem(`geo_${stateId}`)
        let lat = 20
        let lon = 77
        if (cachedGeo) {
          const r = JSON.parse(cachedGeo)
          lat = r.latitude
          lon = r.longitude
        } else {
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=1&language=en&format=json`)
          if (geoRes.ok) {
            const geo = await geoRes.json()
            const r = geo?.results?.[0]
            if (r) {
              lat = r.latitude
              lon = r.longitude
              sessionStorage.setItem(`geo_${stateId}`, JSON.stringify(r))
            }
          }
        }
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`)
        if (wRes.ok && active) {
          const w = await wRes.json()
          const codeMap: Record<number, string> = { 0: 'Sunny', 1: 'Clear', 2: 'Cloudy', 3: 'Overcast', 45: 'Foggy', 95: 'Rainy' }
          setWeather({
            temp: Math.round(w.current.temperature_2m),
            desc: codeMap[w.current.weather_code] || 'Clear'
          })
        }
      } catch {}
    }

    loadWiki()
    loadWeather()
    return () => {
      active = false
    }
  }, [stateId, resolved.name])

  const sectionItems = (s?: any) => s?.items ?? []

  // Transition helper for category details
  const handleOpenCategory = (categoryId: string) => {
    setIsDetailFading(true)
    setTimeout(() => {
      setSelectedCategoryId(categoryId)
      setIsDetailFading(false)
      window.scrollTo(0, 0)
    }, 250)
  }

  const handleCloseCategory = () => {
    setIsDetailFading(true)
    setTimeout(() => {
      setSelectedCategoryId(null)
      setIsDetailFading(false)
    }, 250)
  }

  // Generates dedicated school-student-friendly content segmented into separate panels
  const getCategorySections = (): CategorySection[] => {
    const stateName = resolved.name
    
    switch (selectedCategoryId) {
      case 'history':
        return [
          {
            title: 'Welcome to the Past',
            icon: '📜',
            content: (
              <div>
                <p>History is like a time machine! The story of <strong>{stateName}</strong> is full of brave warriors, grand palaces, and beautiful art. Let's travel back in time to see how this amazing region grew over hundreds of years!</p>
                <p>{resolved.history.summary}</p>
              </div>
            )
          },
          {
            title: 'Origin of the Name',
            icon: '🏷️',
            content: (
              <div>
                <p>Have you ever wondered where the name <strong>{stateName}</strong> comes from? Every place has a meaning behind its name! Often, names are based on ancient kings, local languages, or the mountains and rivers of the region.</p>
                <p>For example, <em>Rajasthan</em> means "The Land of Kings" (Raja means king, and Sthan means place). <em>Kerala</em> comes from the word "Kera," which means coconut tree in the local language, meaning the land of coconut trees! Each name carries a beautiful story of the land's roots.</p>
              </div>
            )
          },
          {
            title: 'Ancient Period',
            icon: '🏺',
            content: (
              <div>
                <p>Thousands of years ago, the first people settled here. They carved tools from stone, built early clay houses, and painted pictures inside mountain caves. Ancient Indian traders traveled from these lands to trade spices, silks, and pearls with empires as far as Rome and Egypt!</p>
              </div>
            )
          },
          {
            title: 'Medieval Period',
            icon: '🏰',
            content: (
              <div>
                <p>During the medieval era, grand kingdoms built massive fortresses on hills and giant stone temples with gold domes. Rulers protected their borders with armies, encouraged music in royal courts, and built beautiful public stepwells to store fresh water for their citizens during dry months.</p>
                {resolved.history.dynasties && (
                  <div className="stat-capsule-glass font-cinzel" style={{ marginTop: '1rem' }}>
                    <strong>Ruling Dynasties:</strong> {resolved.history.dynasties}
                  </div>
                )}
              </div>
            )
          },
          {
            title: 'Modern History & Important Milestones',
            icon: '⚙️',
            content: (
              <div>
                <p>In modern times, the region built railways, schools, and textile mills. After India became independent in 1947, different local princely states joined hands to form the modern boundaries of the state we see today on the map!</p>
                <div className="category-timeline-block" style={{ marginTop: '1.5rem' }}>
                  {sectionItems(resolved.history).map((evt: any, idx: number) => (
                    <div key={idx} className="timeline-milestone-row">
                      <div className="timeline-marker-dot"></div>
                      <div className="timeline-milestone-text">
                        <h4>{evt.title}</h4>
                        <p>{evt.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          },
          {
            title: 'Contribution to India & Freedom Struggle',
            icon: '🇮🇳',
            content: (
              <div>
                <p>The brave people of this state played a major role in helping India gain freedom! Freedom fighters marched in rallies, wrote patriotic songs, and stood up against colonial rule. Today, the state contributes to India's progress through science, farming, and preserving ancient heritage.</p>
              </div>
            )
          }
        ]

      case 'culture':
        return [
          {
            title: 'Cultural Identity',
            icon: '🎭',
            content: (
              <div>
                <p>Culture is the unique heartbeat of a community! The culture of <strong>{stateName}</strong> is like a colorful painting, shaped by local languages, music, values, and ancient traditions.</p>
                <p>{resolved.culture.summary}</p>
              </div>
            )
          },
          {
            title: 'Traditional Attire & Clothing',
            icon: '👗',
            content: (
              <div>
                <p>The clothes people wear here are designed for the climate and look like bright rainbows! Men and women wear garments crafted from hand-spun cotton and silk, adorned with beautiful gold borders and detailed thread-work.</p>
                <p>{resolved.culture.attire || 'Traditional saris, dhotis, and colorful turbans are worn during festivals and family celebrations.'}</p>
              </div>
            )
          },
          {
            title: 'Customs & Traditions',
            icon: '🌸',
            content: (
              <div>
                <p>Customs are beautiful practices that families follow. People greet each other with warm smiles, light oil lamps in temples, and draw decorative patterns (Rangoli or Kolam) at their doorsteps to welcome peace and good fortune into their homes.</p>
                <p>{resolved.culture.customs || 'Festive prayers, dancing in circles, and sharing food reflect the warm hospitality of the locals.'}</p>
              </div>
            )
          },
          {
            title: 'Lifestyle & Occupations',
            icon: '🌾',
            content: (
              <div>
                <p>Most families here lead simple lives closely connected to nature. Many are farmers who grow grains and spices, while others are artisans weaving fabrics, fishermen sailing in coastal waters, or teachers sharing stories of ancient folklore with children.</p>
              </div>
            )
          },
          {
            title: 'Family Values & Community Practices',
            icon: '👨‍👩‍👧',
            content: (
              <div>
                <p>Respecting elders, eating meals together as a big family, and helping neighbors are core values here. During festivals, the entire village gathers to share sweet rice, sing local folk songs, and dance under the evening sky, celebrating unity.</p>
              </div>
            )
          }
        ]

      case 'places':
        return [
          {
            title: 'Tourism Overview',
            icon: '🏛️',
            content: (
              <div>
                <p>Travelling is a wonderful way to learn! <strong>{stateName}</strong> is a favorite destination for travelers from all over the world, offering historical ruins, beautiful wildlife parks, and scenic landscapes.</p>
                <p>{resolved.tourismMonuments.summary}</p>
              </div>
            )
          },
          {
            title: 'Major Tourist Spots',
            icon: '🗺️',
            content: (
              <div className="details-cards-grid">
                {sectionItems(resolved.tourismMonuments).map((item: any, idx: number) => (
                  <div key={idx} className="tourism-spotlight-card glass-panel filigree-card">
                    <div className="filigree-card-corner-tr"></div>
                    <div className="filigree-card-corner-bl"></div>
                    <div className="filigree-card-corner-br"></div>
                    <h4 className="spotlight-title">{item.title}</h4>
                    <p className="spotlight-desc">{item.description}</p>
                    <div className="spotlight-footer">
                      <span>⭐⭐⭐⭐⭐</span>
                      <span>Season: Oct - Mar</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          },
          {
            title: 'Activities & Adventure',
            icon: '🧗',
            content: (
              <div>
                <p>Visitors can enjoy wonderful outdoor adventures! You can go boating in calm lakes, explore ancient castle chambers, watch birds in dense forests, or enjoy desert safaris on camels under the starry sky.</p>
              </div>
            )
          },
          {
            title: 'Best Time to Visit & Travel Tips',
            icon: '🎒',
            content: (
              <div>
                <p>The best time to visit is during the cooler months between <strong>October and March</strong>. We recommend wearing light cotton clothing in summers, carrying warm jackets for desert winter nights, and always trying the local food!</p>
              </div>
            )
          }
        ]

      case 'food':
        return [
          {
            title: 'Food Culture Overview',
            icon: '🍛',
            content: (
              <div>
                <p>Eating together is a celebration of life! The food culture of <strong>{stateName}</strong> is shaped by the grains, vegetables, and spices that grow in the local soil. Every dish is a flavorful journey!</p>
                <p>{resolved.foodCuisine.summary}</p>
              </div>
            )
          },
          {
            title: 'Famous Dishes',
            icon: '🍲',
            content: (
              <div>
                <p>Every home has its signature recipes. These signature dishes are made with love, utilizing slow-cooking methods on open clay stoves to lock in the traditional flavors.</p>
                <p>{resolved.foodCuisine.signatureDishes || 'Rich lentil curries, flatbreads, and aromatic rice dishes form the staple diet.'}</p>
                {sectionItems(resolved.foodCuisine).length > 0 && (
                  <div className="details-cards-grid" style={{ marginTop: '1.5rem' }}>
                    {sectionItems(resolved.foodCuisine).map((item: any, idx: number) => (
                      <StateCard key={idx} title={item.title} category="food" description={item.description} />
                    ))}
                  </div>
                )}
              </div>
            )
          },
          {
            title: 'Traditional Spices & Ingredients',
            icon: '🌶️',
            content: (
              <div>
                <p>Local spices make the food smell heavenly! Chefs use fresh ingredients like cardamom, mustard seeds, turmeric, coriander, and saffron to create unique, warm flavors.</p>
              </div>
            )
          },
          {
            title: 'Sweets & Traditional Desserts',
            icon: '🍡',
            content: (
              <div>
                <p>Sweet desserts are shared to spread happiness! Milk puddings, sweet rice, and honeyed wheat cakes are prepared for guests during festivals and family gatherings.</p>
                <p>{resolved.foodCuisine.sweets || 'Traditional sweet delicacies made with milk, sugar, and dry fruits.'}</p>
              </div>
            )
          },
          {
            title: 'Street Food & Snacks',
            icon: '🥞',
            content: (
              <div>
                <p>If you walk down local markets, you will find vendors selling hot, crispy snacks! Spicy flatbreads, fried potato pies, and crispy lentil wafers are loved by kids after school.</p>
                <p>{resolved.foodCuisine.streetFood}</p>
              </div>
            )
          },
          {
            title: 'Food Habits & Traditions',
            icon: '🪔',
            content: (
              <div>
                <p>Food is served with respect. In many places, people sit on the floor and eat from fresh green banana leaves. It is a tradition to wash hands before eating, eat with your fingers, and offer the first portion of the meal to nature or birds.</p>
              </div>
            )
          }
        ]

      case 'festivals':
        return [
          {
            title: 'Celebration Spirit',
            icon: '🏮',
            content: (
              <div>
                <p>Festivals bring families closer! In <strong>{stateName}</strong>, festivals are celebrated with bright lights, colorful flags, sweet feasts, and traditional prayers.</p>
                <p>{resolved.festivals.summary}</p>
              </div>
            )
          },
          {
            title: 'Major Festivals',
            icon: '🎉',
            content: (
              <div>
                <p>The state celebrates grand festivals that mark seasonal updates and ancient histories. Homes are painted, new clothes are worn, and people visit relatives to share boxes of sweets.</p>
                <p>{resolved.festivals.majorFestivals || 'Grand spiritual prayers, colorful street rallies, and classical dance festivals.'}</p>
              </div>
            )
          },
          {
            title: 'Special Rituals & Feasts',
            icon: '🪔',
            content: (
              <div>
                <p>During celebrations, families perform beautiful rituals. They light rows of oil lamps, paint patterns on walls, wear traditional masks, and cook grand feasts with sweet rice and coconut milk.</p>
              </div>
            )
          },
          {
            title: 'Harvest & Seasonal Festivals',
            icon: '🌾',
            content: (
              <div>
                <p>Harvest festivals are extra special! Farmers thank the sun, the soil, and their cows for giving them healthy crops. They dance around fires, play traditional drums, and celebrate a successful harvest.</p>
                <p>{resolved.festivals.harvestFestivals || 'Harvest festivals celebrated with grand boat races, flower mats, and sports.'}</p>
              </div>
            )
          },
          {
            title: 'Lesser-Known Local Festivals',
            icon: '💡',
            content: (
              <div>
                <p>Apart from major celebrations, tiny forest villages celebrate local fairs. They pray to tree spirits, carry clay deities on chariots, and hold puppet shows for kids.</p>
                <p>{resolved.festivals.fairsMelas}</p>
              </div>
            )
          }
        ]

      case 'art':
        return [
          {
            title: 'Handicrafts & Artisans',
            icon: '🎨',
            content: (
              <div>
                <p>Artisans use their hands to create magic! They sculpt toys from wood, mold pots from blue clay, and carve brass plates. These crafts have been passed down from parents to children for generations.</p>
                <p>{resolved.artCrafts.summary}</p>
                <p>{resolved.artCrafts.handicrafts}</p>
              </div>
            )
          },
          {
            title: 'Weaving & Textiles',
            icon: '🧵',
            content: (
              <div>
                <p>Weavers create beautiful fabrics! They tie and dye cotton threads to make patterns, and weave shining silk saris with gold borders that look like royal garments.</p>
                <p>{resolved.artCrafts.weavingTextiles}</p>
              </div>
            )
          }
        ]

      case 'geography':
        return [
          {
            title: 'Location & Boundaries',
            icon: '🌍',
            content: (
              <div>
                <p><strong>{stateName}</strong> is bordered by neighboring states, majestic hills, or sparkling coastlines. Its location shapes its weather and forest covers.</p>
                <p>{resolved.geography.summary}</p>
              </div>
            )
          },
          {
            title: 'Mountains & Forests',
            icon: '⛰️',
            content: (
              <div>
                <p>Majestic mountain ranges protect the valleys. These mountains are covered in dense forests of teak and sandalwood trees, home to wild deer, elephants, and leopards.</p>
                <p>{resolved.geography.mountains}</p>
              </div>
            )
          },
          {
            title: 'Rivers & Lakes',
            icon: '🌊',
            content: (
              <div>
                <p>Flowing rivers are the lifelines of the land, providing fresh drinking water to cities and helping farmers water their fields. Kids swim in local ponds, and families sail boats in backwater lagoons.</p>
                <p>{resolved.geography.rivers}</p>
              </div>
            )
          },
          {
            title: 'Climate & Seasons',
            icon: '🌤️',
            content: (
              <div>
                <p>The state has distinct seasons: warm summers, refreshing monsoons with heavy rain, and cool, pleasant winters. The climate determines when farmers plant seeds and harvest crops.</p>
              </div>
            )
          },
          {
            title: 'Wildlife & Biodiversity',
            icon: '🌳',
            content: (
              <div>
                <p>Protected sanctuaries secure endangered wildlife. Beautiful birds migrate here from cold northern countries every winter, filling local lakes with color.</p>
                <p>{resolved.geography.nationalParks}</p>
              </div>
            )
          }
        ]

      case 'economy':
        return [
          {
            title: 'Economic Strengths',
            icon: '💼',
            content: (
              <div>
                <p>The economy is driven by services, agriculture, and rising tourism. GSDP growth is supported by local handicrafts and software parks.</p>
                <p>{resolved.economyIndustries.summary}</p>
                <div className="stacked-sector-progress-bar" style={{ marginTop: '1.5rem' }}>
                  <div className="sector-segment agrisector" style={{ width: '30%' }}>Agr: 30%</div>
                  <div className="sector-segment indisector" style={{ width: '28%' }}>Ind: 28%</div>
                  <div className="sector-segment servsector" style={{ width: '42%' }}>Services: 42%</div>
                </div>
              </div>
            )
          },
          {
            title: 'Major Industries & Agriculture',
            icon: '🏭',
            content: (
              <div className="details-cards-grid">
                <div className="detail-fact-card-split glass-panel">
                  <strong>🌾 Agriculture</strong>
                  <p>{resolved.economyIndustries.agriculture || 'Wheat, Rice & Local Crops'}</p>
                </div>
                <div className="detail-fact-card-split glass-panel">
                  <strong>🏭 Industries</strong>
                  <p>{resolved.economyIndustries.industries || 'Handlooms, Textiles & Factories'}</p>
                </div>
                <div className="detail-fact-card-split glass-panel">
                  <strong>💎 Minerals</strong>
                  <p>{resolved.economyIndustries.mineralsResources || 'Granite, Limestone & Coal'}</p>
                </div>
              </div>
            )
          }
        ]

      case 'education':
        return [
          {
            title: 'Learning & Schools',
            icon: '🎓',
            content: (
              <div>
                <p>Education is a priority! The state has built schools in rural areas, encouraging boys and girls to study science, languages, and traditional arts.</p>
                <p>{resolved.educationInnovation.summary}</p>
              </div>
            )
          },
          {
            title: 'Famous Universities & Research',
            icon: '🏫',
            content: (
              <div className="details-cards-grid">
                <div className="detail-fact-card-split glass-panel">
                  <strong>🏫 Universities</strong>
                  <p>{resolved.educationInnovation.universities || 'Central State Universities and Engineering Academies'}</p>
                </div>
                <div className="detail-fact-card-split glass-panel">
                  <strong>🔬 Science Research</strong>
                  <p>{resolved.educationInnovation.scientific || 'State innovation labs and research bureaus.'}</p>
                </div>
              </div>
            )
          }
        ]

      case 'languages':
        return [
          {
            title: 'Official Languages & Dialects',
            icon: '🗣️',
            content: (
              <div>
                <p>Languages bridge history! Dialects preserve ancient proverbs that local children learn from their grandparents.</p>
                <div className="stat-capsule-glass font-cinzel" style={{ marginTop: '1rem' }}>
                  <strong>Main Languages Spoken:</strong> {resolved.identity.languages}
                </div>
              </div>
            )
          }
        ]

      case 'transport':
        return [
          {
            title: 'Travel & Connectivity',
            icon: '🚂',
            content: (
              <div className="details-cards-grid">
                <div className="detail-fact-card-split glass-panel">
                  <strong>🛫 Airports</strong>
                  <p>Regional airports connect capital flights with major metropolitan grids.</p>
                </div>
                <div className="detail-fact-card-split glass-panel">
                  <strong>🚂 Railways</strong>
                  <p>Central junctions provide express connections across national tracks.</p>
                </div>
              </div>
            )
          }
        ]



      default:
        return []
    }
  }

  return (
    <div className="state-detail-page split-layout-wrapper">
      <div className="state-detail-page-overlay"></div>

      {/* TOP HEADER MENU */}
      <header className="split-top-header">
        <button className="btn-back-map" onClick={() => navigate('/map')}>
          ← Return to Map
        </button>
        <div className="hero-brand-logo" onClick={() => navigate('/')}>
          Reetiverse
        </div>
        {weather?.temp !== undefined ? (
          <div className="hero-weather-pill">
            🌤️ {weather.temp}°C
          </div>
        ) : (
          <div className="hero-weather-placeholder"></div>
        )}
      </header>

      {/* SPLIT VIEW (LEFT IMAGE + RIGHT CATEGORIES GRID) */}
      <div className="split-page-main-container">
        
        {/* LEFT COLUMN: Cover Image + State Name */}
        <div className="split-left-panel" style={{ backgroundImage: `url(${activeCoverImage})` }}>
          <div className="split-left-gradient-overlay"></div>
          <div className="split-left-content">
            <h1 className="split-state-name">{resolved.name}</h1>
            <p className="split-state-tagline">{stateTagline}</p>
            
            <div className="split-emblems-summary">
              <span>Capital: {resolved.identity.capital}</span>
              <span>•</span>
              <span>Formation: {resolved.identity.formationDay}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 12 Category Glassmorphic Cards */}
        <div className="split-right-panel">
          <div className="split-right-scroll-wrapper">
            <div className="split-grid-instruction">
              <h2>Explore the Heritage</h2>
              <p>Select any category below to open the interactive manuscript registries.</p>
            </div>
            
            <div className="categories-grid-split">
              {categoriesList.map(cat => (
                <div
                  key={cat.id}
                  className="category-card-split glass-panel"
                  onClick={() => handleOpenCategory(cat.id)}
                >
                  <span className="category-split-icon">{cat.icon}</span>
                  <span className="category-split-name">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* DEDICATED FULL-SCREEN OVERLAY: CATEGORY DETAILS VIEW (Vertically Scrollable Stacked Cards) */}
      {selectedCategoryId !== null && (
        <div className={`category-details-overlay ${isDetailFading ? 'overlay-fading' : ''}`}>
          
          {/* Blurred full-screen background cover (darkened by 65-70%) */}
          <div 
            className="category-details-backdrop" 
            style={{ backgroundImage: `url(${activeCoverImage})` }} 
          />
          <div className="category-details-dark-overlay"></div>

          {/* Sticky Sub-menu Top Bar */}
          <header className="details-overlay-header">
            <button className="btn-back-overview" onClick={handleCloseCategory}>
              ← Back to State Overview
            </button>
            <div className="overlay-title-group">
              <h2 className="overlay-category-title">
                {categoriesList.find(c => c.id === selectedCategoryId)?.name}
              </h2>
              <span className="overlay-state-subtitle">{resolved.name} Registry</span>
            </div>
            <div className="header-decoration-gold">❖ ⚜ ❖</div>
          </header>

          {/* Fully Vertically Scrollable content body container containing separate glass cards */}
          <div className="details-scrollable-body-container">
            <div className="details-scrollable-body-max-width">
              {getCategorySections().map((sec, idx) => (
                <div key={idx} className="manuscript-section-card glass-panel filigree-card">
                  <div className="filigree-card-corner-tr"></div>
                  <div className="filigree-card-corner-bl"></div>
                  <div className="filigree-card-corner-br"></div>
                  <h3 className="section-card-title">{sec.icon} {sec.title}</h3>
                  <div className="card-divider gold-divider"></div>
                  <div className="section-card-content-body">
                    {sec.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Floating Chatbot widget */}
      <Chatbot anchorStateId={stateId} />
    </div>
  )
}

export default StateDetailPage
