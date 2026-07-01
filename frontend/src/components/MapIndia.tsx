import mapImage from '../../Map.jpeg'
import './MapIndia.css'

interface MapIndiaProps {
  selectedStateId: string | null;
  onSelectState: (id: string) => void;
}

const stateMarkers: { id: string; name: string; x: number; y: number; dense?: boolean }[] = [
  { id: 'jammu_kashmir', name: 'Jammu & Kashmir', x: 290, y: 110 },
  { id: 'ladakh', name: 'Ladakh', x: 345, y: 95, dense: true },
  { id: 'himachal_pradesh', name: 'Himachal Pradesh', x: 300, y: 175, dense: true },
  { id: 'punjab', name: 'Punjab', x: 260, y: 220, dense: true },
  { id: 'chandigarh', name: 'Chandigarh', x: 288, y: 220, dense: true },
  { id: 'haryana', name: 'Haryana', x: 295, y: 250, dense: true },
  { id: 'delhi', name: 'Delhi', x: 302, y: 265, dense: true },
  { id: 'uttarakhand', name: 'Uttarakhand', x: 345, y: 215, dense: true },
  { id: 'rajasthan', name: 'Rajasthan', x: 225, y: 340 },
  { id: 'gujarat', name: 'Gujarat', x: 195, y: 445 },
  { id: 'madhya_pradesh', name: 'Madhya Pradesh', x: 340, y: 440 },
  { id: 'uttar_pradesh', name: 'Uttar Pradesh', x: 395, y: 310 },
  { id: 'bihar', name: 'Bihar', x: 475, y: 340 },
  { id: 'jharkhand', name: 'Jharkhand', x: 465, y: 405 },
  { id: 'west_bengal', name: 'West Bengal', x: 520, y: 410 },
  { id: 'sikkim', name: 'Sikkim', x: 500, y: 275, dense: true },
  { id: 'assam', name: 'Assam', x: 565, y: 295, dense: true },
  { id: 'arunachal_pradesh', name: 'Arunachal Pradesh', x: 615, y: 255, dense: true },
  { id: 'nagaland', name: 'Nagaland', x: 625, y: 305, dense: true },
  { id: 'manipur', name: 'Manipur', x: 620, y: 350, dense: true },
  { id: 'tripura', name: 'Tripura', x: 575, y: 395, dense: true },
  { id: 'meghalaya', name: 'Meghalaya', x: 545, y: 340, dense: true },
  { id: 'mizoram', name: 'Mizoram', x: 605, y: 395, dense: true },
  { id: 'chhattisgarh', name: 'Chhattisgarh', x: 415, y: 490 },
  { id: 'odisha', name: 'Odisha', x: 460, y: 505 },
  { id: 'maharashtra', name: 'Maharashtra', x: 315, y: 550 },
  { id: 'dadra_nagar_haveli', name: 'Dadra & Nagar Haveli and Daman & Diu', x: 225, y: 535 },
  { id: 'goa', name: 'Goa', x: 260, y: 660 },
  { id: 'karnataka', name: 'Karnataka', x: 310, y: 720 },
  { id: 'telangana', name: 'Telangana', x: 385, y: 590 },
  { id: 'andhra_pradesh', name: 'Andhra Pradesh', x: 395, y: 685 },
  { id: 'tamil_nadu', name: 'Tamil Nadu', x: 360, y: 810 },
  { id: 'kerala', name: 'Kerala', x: 310, y: 815 },
  { id: 'puducherry', name: 'Puducherry', x: 425, y: 760 },
  { id: 'lakshadweep', name: 'Lakshadweep', x: 185, y: 850 },
  { id: 'andaman_nicobar', name: 'Andaman & Nicobar Islands', x: 615, y: 850 }
]

function MapIndia({ selectedStateId, onSelectState }: MapIndiaProps) {
  const handleStateClick = (stateId: string) => {
    onSelectState(stateId)
  }

  return (
    <div className="map-india-container">
      <div className="map-parchment-texture"></div>
      <svg 
        viewBox="100 95 540 785"
        className="india-map-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <image
          href={mapImage}
          x="0"
          y="0"
          width="736"
          height="946"
          preserveAspectRatio="xMidYMid meet"
          className="india-map-image"
        />

        {stateMarkers.map(marker => (
          <g
            key={marker.id}
            className={`state-marker ${selectedStateId === marker.id ? 'state-marker--selected' : ''}`}
            transform={`translate(${marker.x}, ${marker.y})`}
            onClick={() => handleStateClick(marker.id)}
          >
            {/* Expanded hit area for hover tolerance */}
            <circle r="22" className="state-marker__hit" />
            
            {/* Glowing Golden Circle Dot (20-30% larger, radius 7px) */}
            <circle cx="0" cy="0" r="7.2" className="state-marker__dot" />
            
            {/* Shimmery glisten core */}
            <circle cx="0" cy="0" r="2.2" className="state-marker__center-core" />

            {/* Titlecase Labels positioned below the dot, center aligned */}
            <text 
              className={`state-marker__label ${marker.dense ? 'state-marker__label--dense' : ''}`} 
              x="0" 
              y="21"
            >
              {marker.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

export default MapIndia
