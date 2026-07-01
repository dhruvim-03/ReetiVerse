interface StateCardProps {
  title: string;
  description?: string;
  category: string;
}

const categoryIcons: Record<string, string> = {
  food: '🍛',
  attire: '👗',
  festival: '🏮',
  music: '🎭',
  art: '🎨',
  travel: '🏛️',
  person: '👤',
  culture: '🌸'
}

const categoryGradients: Record<string, string> = {
  food: 'linear-gradient(135deg, rgba(184, 80, 42, 0.25) 0%, rgba(78, 26, 18, 0.45) 100%)',
  attire: 'linear-gradient(135deg, rgba(78, 26, 18, 0.35) 0%, rgba(47, 24, 16, 0.55) 100%)',
  festival: 'linear-gradient(135deg, rgba(184, 80, 42, 0.25) 0%, rgba(197, 160, 89, 0.3) 100%)',
  music: 'linear-gradient(135deg, rgba(58, 92, 72, 0.25) 0%, rgba(47, 24, 16, 0.55) 100%)',
  art: 'linear-gradient(135deg, rgba(197, 160, 89, 0.25) 0%, rgba(78, 26, 18, 0.45) 100%)',
  travel: 'linear-gradient(135deg, rgba(58, 92, 72, 0.25) 0%, rgba(47, 24, 16, 0.55) 100%)',
  person: 'linear-gradient(135deg, rgba(47, 24, 16, 0.4) 0%, rgba(0, 0, 0, 0.5) 100%)',
  culture: 'linear-gradient(135deg, rgba(78, 26, 18, 0.35) 0%, rgba(47, 24, 16, 0.55) 100%)'
}

export default function StateCard({ title, description, category }: StateCardProps) {
  const cleanCategory = category.toLowerCase().includes('food') ? 'food' :
                        category.toLowerCase().includes('attire') ? 'attire' :
                        category.toLowerCase().includes('festival') ? 'festival' :
                        category.toLowerCase().includes('music') || category.toLowerCase().includes('dance') ? 'music' :
                        category.toLowerCase().includes('art') || category.toLowerCase().includes('craft') ? 'art' :
                        category.toLowerCase().includes('travel') || category.toLowerCase().includes('monument') || category.toLowerCase().includes('tourist') ? 'travel' :
                        category.toLowerCase().includes('person') || category.toLowerCase().includes('personalities') ? 'person' :
                        'culture'

  const icon = categoryIcons[cleanCategory] || '🌸'
  const gradient = categoryGradients[cleanCategory] || categoryGradients.culture

  // Split description paragraphs if there are double newlines
  const renderCardDescription = (desc?: string) => {
    if (!desc) return null;
    const parts = desc.split('\n\n');
    return parts.map((p, idx) => (
      <p key={idx} className="card-desc-para">
        {p}
      </p>
    ));
  };

  return (
    <div className="card text-only-card filigree-card" style={{ background: gradient }}>
      <div className="filigree-card-corner-tr"></div>
      <div className="filigree-card-corner-bl"></div>
      <div className="filigree-card-corner-br"></div>
      <div className="card-pattern-overlay"></div>
      
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        {renderCardDescription(description)}
      </div>
      <div className="card-ornament">✦ ⚜ ✦</div>
    </div>
  )
}
