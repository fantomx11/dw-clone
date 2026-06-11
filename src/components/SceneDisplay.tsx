interface SceneDisplayProps {
  backgroundImage: string;
  activeNpcImage?: string;
}

export default function SceneDisplay({ backgroundImage, activeNpcImage }: SceneDisplayProps) {
  return (
    <div className="absolute inset-0 z-0">
      {/* Background Graphic */}
      <img 
        src={`/${backgroundImage}`} 
        alt="Scene Background" 
        className="w-full h-full object-cover rendering-pixelated transition-opacity duration-300"
      />
      
      {/* Absolute Sprite Positioning for Visual Novel Interactivity */}
      {activeNpcImage && (
        <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-48 h-64 transition-all duration-300">
          <img 
            src={`/${activeNpcImage}`} 
            alt="NPC Sprite" 
            className="w-full h-full object-contain rendering-pixelated animate-bounce-slow" 
          />
        </div>
      )}
    </div>
  );
}