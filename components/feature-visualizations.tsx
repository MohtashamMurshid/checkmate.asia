import { cn } from '@/lib/utils'

interface VisualizationProps {
  className?: string
}

// Enterprise API Visualization - Shows API connectivity and data flow
export const EnterpriseApiVisual = ({ className }: VisualizationProps) => (
  <svg
    viewBox="0 0 400 300"
    className={cn("w-full h-full", className)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Central API Hub */}
    <rect
      x="150"
      y="100"
      width="100"
      height="100"
      rx="8"
      className="stroke-primary fill-background"
      strokeWidth="2"
    />
    <text
      x="200"
      y="155"
      textAnchor="middle"
      className="fill-primary text-sm font-medium"
      fontSize="14"
    >
      API
    </text>
    
    {/* Connected Services/Nodes */}
    {/* Top Left */}
    <circle cx="80" cy="60" r="20" className="stroke-primary fill-background" strokeWidth="2" />
    <text x="80" y="64" textAnchor="middle" className="fill-primary text-[10px] font-medium">Client</text>
    <line x1="100" y1="60" x2="150" y2="120" className="stroke-primary/40" strokeWidth="1.5" strokeDasharray="4 4" />
    
    {/* Top Right */}
    <circle cx="320" cy="60" r="20" className="stroke-primary fill-background" strokeWidth="2" />
    <text x="320" y="64" textAnchor="middle" className="fill-primary text-[10px] font-medium">Server</text>
    <line x1="300" y1="60" x2="250" y2="120" className="stroke-primary/40" strokeWidth="1.5" strokeDasharray="4 4" />
    
    {/* Bottom Left */}
    <circle cx="80" cy="240" r="20" className="stroke-primary fill-background" strokeWidth="2" />
    <text x="80" y="244" textAnchor="middle" className="fill-primary text-[10px] font-medium">DB</text>
    <line x1="100" y1="240" x2="150" y2="180" className="stroke-primary/40" strokeWidth="1.5" strokeDasharray="4 4" />
    
    {/* Bottom Right */}
    <circle cx="320" cy="240" r="20" className="stroke-primary fill-background" strokeWidth="2" />
    <text x="320" y="244" textAnchor="middle" className="fill-primary text-[10px] font-medium">Auth</text>
    
    {/* Data Flow Indicators */}
    <circle cx="200" cy="80" r="3" className="fill-primary animate-pulse" />
    <circle cx="200" cy="220" r="3" className="fill-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
    
    {/* Request/Response Arrows */}
    <path
      d="M 180 100 L 160 90 L 165 100 L 160 110 Z"
      className="fill-primary/60"
    />
    <path
      d="M 220 200 L 240 210 L 235 200 L 240 190 Z"
      className="fill-primary/60"
    />
  </svg>
)

// Agent Deployment Visualization - Shows on-premise security and local deployment
export const AgentDeploymentVisual = ({ className }: VisualizationProps) => (
  <svg
    viewBox="0 0 400 300"
    className={cn("w-full h-full", className)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Server/Infrastructure Box */}
    <rect
      x="100"
      y="80"
      width="200"
      height="140"
      rx="8"
      className="stroke-primary fill-background/50"
      strokeWidth="2"
    />
    
    {/* Server Racks/Units */}
    <rect x="120" y="100" width="160" height="20" rx="2" className="fill-primary/20" />
    <rect x="120" y="130" width="160" height="20" rx="2" className="fill-primary/20" />
    <rect x="120" y="160" width="160" height="20" rx="2" className="fill-primary/20" />
    <rect x="120" y="190" width="160" height="20" rx="2" className="fill-primary/20" />
    
    {/* Security Shield */}
    <path
      d="M 200 50 L 220 60 L 220 80 L 200 90 L 180 80 L 180 60 Z"
      className="stroke-primary fill-primary/10"
      strokeWidth="2"
    />
    <circle cx="200" cy="70" r="8" className="fill-primary" />
    
    {/* Lock Icon */}
    <rect x="195" y="75" width="10" height="8" rx="1" className="fill-background" />
    <path d="M 197 75 L 197 72 L 203 72 L 203 75" className="stroke-background" strokeWidth="1.5" fill="none" />
    <text x="240" y="75" className="fill-primary text-xs font-medium">Secure</text>
    
    {/* Connection Lines */}
    <line x1="200" y1="50" x2="200" y2="80" className="stroke-primary/40" strokeWidth="1.5" />
    
    {/* Local Network Indicators */}
    <circle cx="60" cy="150" r="15" className="stroke-primary fill-background" strokeWidth="2" />
    <text x="60" y="154" textAnchor="middle" className="fill-primary text-[10px] font-medium">Local</text>
    <circle cx="60" cy="150" r="8" className="fill-primary/30" />
    <line x1="75" y1="150" x2="100" y2="150" className="stroke-primary/40" strokeWidth="1.5" />
    
    <circle cx="340" cy="150" r="15" className="stroke-primary fill-background" strokeWidth="2" />
    <text x="340" y="154" textAnchor="middle" className="fill-primary text-[10px] font-medium">LAN</text>
    <line x1="325" y1="150" x2="300" y2="150" className="stroke-primary/40" strokeWidth="1.5" />
    
    {/* Data Flow */}
    <path
      d="M 200 220 Q 150 250, 100 270"
      className="stroke-primary/30"
      strokeWidth="2"
      fill="none"
      strokeDasharray="3 3"
    />
    <path
      d="M 200 220 Q 250 250, 300 270"
      className="stroke-primary/30"
      strokeWidth="2"
      fill="none"
      strokeDasharray="3 3"
    />
  </svg>
)

// Multi-Platform Background - Network of connected nodes/media types
export const MultiPlatformBg = ({ className }: VisualizationProps) => (
  <svg
    viewBox="0 0 400 300"
    className={cn("absolute inset-0 w-full h-full opacity-20", className)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Platform Nodes */}
    <circle cx="80" cy="80" r="12" className="fill-primary/30" />
    <text x="80" y="84" textAnchor="middle" className="fill-primary text-[8px] font-medium opacity-60">Social</text>
    <circle cx="200" cy="60" r="12" className="fill-primary/30" />
    <text x="200" y="64" textAnchor="middle" className="fill-primary text-[8px] font-medium opacity-60">Web</text>
    <circle cx="320" cy="80" r="12" className="fill-primary/30" />
    <text x="320" y="84" textAnchor="middle" className="fill-primary text-[8px] font-medium opacity-60">Media</text>
    <circle cx="100" cy="180" r="12" className="fill-primary/30" />
    <text x="100" y="184" textAnchor="middle" className="fill-primary text-[8px] font-medium opacity-60">Video</text>
    <circle cx="250" cy="200" r="12" className="fill-primary/30" />
    <text x="250" y="204" textAnchor="middle" className="fill-primary text-[8px] font-medium opacity-60">Audio</text>
    <circle cx="320" cy="240" r="12" className="fill-primary/30" />
    <text x="320" y="244" textAnchor="middle" className="fill-primary text-[8px] font-medium opacity-60">News</text>
    
    {/* Connection Lines */}
    <line x1="80" y1="80" x2="200" y2="60" className="stroke-primary/20" strokeWidth="1" />
    <line x1="200" y1="60" x2="320" y2="80" className="stroke-primary/20" strokeWidth="1" />
    <line x1="80" y1="80" x2="100" y2="180" className="stroke-primary/20" strokeWidth="1" />
    <line x1="200" y1="60" x2="250" y2="200" className="stroke-primary/20" strokeWidth="1" />
    <line x1="320" y1="80" x2="320" y2="240" className="stroke-primary/20" strokeWidth="1" />
    <line x1="100" y1="180" x2="250" y2="200" className="stroke-primary/20" strokeWidth="1" />
    <line x1="250" y1="200" x2="320" y2="240" className="stroke-primary/20" strokeWidth="1" />
  </svg>
)

// AI Detection Background - Neural network/synapse pattern
export const AiDetectionBg = ({ className }: VisualizationProps) => (
  <svg
    viewBox="0 0 400 300"
    className={cn("absolute inset-0 w-full h-full opacity-20", className)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Neural Network Nodes */}
    <text x="50" y="80" className="fill-accent text-xs font-medium opacity-50">Input</text>
    <circle cx="100" cy="80" r="8" className="fill-accent/40" />
    <circle cx="150" cy="60" r="8" className="fill-accent/40" />
    <circle cx="200" cy="80" r="8" className="fill-accent/40" />
    <circle cx="250" cy="60" r="8" className="fill-accent/40" />
    <circle cx="300" cy="80" r="8" className="fill-accent/40" />
    
    <text x="30" y="150" className="fill-accent text-xs font-medium opacity-50">Process</text>
    <circle cx="80" cy="150" r="8" className="fill-accent/40" />
    <circle cx="150" cy="140" r="8" className="fill-accent/40" />
    <circle cx="220" cy="150" r="8" className="fill-accent/40" />
    <circle cx="280" cy="140" r="8" className="fill-accent/40" />
    <circle cx="320" cy="150" r="8" className="fill-accent/40" />
    
    <circle cx="100" cy="220" r="8" className="fill-accent/40" />
    <circle cx="180" cy="230" r="8" className="fill-accent/40" />
    <circle cx="250" cy="220" r="8" className="fill-accent/40" />
    <circle cx="300" cy="230" r="8" className="fill-accent/40" />
    <text x="330" y="230" className="fill-accent text-xs font-medium opacity-50">Score</text>
    
    {/* Synapse Connections */}
    <line x1="100" y1="80" x2="150" y2="60" className="stroke-accent/20" strokeWidth="1" />
    <line x1="150" y1="60" x2="200" y2="80" className="stroke-accent/20" strokeWidth="1" />
    <line x1="200" y1="80" x2="250" y2="60" className="stroke-accent/20" strokeWidth="1" />
    <line x1="250" y1="60" x2="300" y2="80" className="stroke-accent/20" strokeWidth="1" />
    
    <line x1="100" y1="80" x2="80" y2="150" className="stroke-accent/20" strokeWidth="1" />
    <line x1="150" y1="60" x2="150" y2="140" className="stroke-accent/20" strokeWidth="1" />
    <line x1="200" y1="80" x2="220" y2="150" className="stroke-accent/20" strokeWidth="1" />
    <line x1="250" y1="60" x2="280" y2="140" className="stroke-accent/20" strokeWidth="1" />
    <line x1="300" y1="80" x2="320" y2="150" className="stroke-accent/20" strokeWidth="1" />
    
    <line x1="80" y1="150" x2="100" y2="220" className="stroke-accent/20" strokeWidth="1" />
    <line x1="150" y1="140" x2="180" y2="230" className="stroke-accent/20" strokeWidth="1" />
    <line x1="220" y1="150" x2="250" y2="220" className="stroke-accent/20" strokeWidth="1" />
    <line x1="280" y1="140" x2="300" y2="230" className="stroke-accent/20" strokeWidth="1" />
  </svg>
)

// Fact-Checking Background - Verification grid/shield pattern
export const FactCheckBg = ({ className }: VisualizationProps) => (
  <svg
    viewBox="0 0 400 300"
    className={cn("absolute inset-0 w-full h-full opacity-20", className)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Verification Grid */}
    <rect x="50" y="50" width="300" height="200" rx="4" className="stroke-chart-3/30" strokeWidth="1" fill="none" />
    <line x1="150" y1="50" x2="150" y2="250" className="stroke-chart-3/20" strokeWidth="1" />
    <line x1="250" y1="50" x2="250" y2="250" className="stroke-chart-3/20" strokeWidth="1" />
    <line x1="50" y1="120" x2="350" y2="120" className="stroke-chart-3/20" strokeWidth="1" />
    <line x1="50" y1="180" x2="350" y2="180" className="stroke-chart-3/20" strokeWidth="1" />
    
    {/* Checkmarks */}
    <path
      d="M 100 100 L 115 115 L 140 90"
      className="stroke-chart-3/40"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M 200 140 L 215 155 L 240 130"
      className="stroke-chart-3/40"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M 280 200 L 295 215 L 320 190"
      className="stroke-chart-3/40"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    
    {/* Shield Pattern */}
    <path
      d="M 200 60 L 220 70 L 220 90 L 200 100 L 180 90 L 180 70 Z"
      className="stroke-chart-3/30"
      strokeWidth="2"
      fill="none"
    />
    <text x="200" y="85" textAnchor="middle" className="fill-chart-3/50 text-[10px] font-bold">VERIFIED</text>
  </svg>
)

// Creator Credibility Background - Community/Node graph pattern
export const CreatorCredBg = ({ className }: VisualizationProps) => (
  <svg
    viewBox="0 0 400 300"
    className={cn("absolute inset-0 w-full h-full opacity-20", className)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Central Creator Node */}
    <circle cx="200" cy="150" r="20" className="fill-chart-2/40" />
    <circle cx="200" cy="150" r="12" className="fill-chart-2/60" />
    <text x="200" y="185" textAnchor="middle" className="fill-chart-2 text-xs font-medium opacity-80">Creator</text>
    
    {/* Community Nodes */}
    <text x="50" y="80" className="fill-chart-2 text-[10px] font-medium opacity-60">Community</text>
    <circle cx="100" cy="80" r="12" className="fill-chart-2/30" />
    <circle cx="300" cy="80" r="12" className="fill-chart-2/30" />
    <circle cx="80" cy="180" r="12" className="fill-chart-2/30" />
    <circle cx="320" cy="180" r="12" className="fill-chart-2/30" />
    <circle cx="120" cy="240" r="12" className="fill-chart-2/30" />
    <circle cx="280" cy="240" r="12" className="fill-chart-2/30" />
    
    {/* Connection Lines */}
    <line x1="200" y1="150" x2="100" y2="80" className="stroke-chart-2/20" strokeWidth="1.5" />
    <line x1="200" y1="150" x2="300" y2="80" className="stroke-chart-2/20" strokeWidth="1.5" />
    <line x1="200" y1="150" x2="80" y2="180" className="stroke-chart-2/20" strokeWidth="1.5" />
    <line x1="200" y1="150" x2="320" y2="180" className="stroke-chart-2/20" strokeWidth="1.5" />
    <line x1="200" y1="150" x2="120" y2="240" className="stroke-chart-2/20" strokeWidth="1.5" />
    <line x1="200" y1="150" x2="280" y2="240" className="stroke-chart-2/20" strokeWidth="1.5" />
    
    {/* Inter-community connections */}
    <line x1="100" y1="80" x2="300" y2="80" className="stroke-chart-2/15" strokeWidth="1" strokeDasharray="2 2" />
    <line x1="80" y1="180" x2="320" y2="180" className="stroke-chart-2/15" strokeWidth="1" strokeDasharray="2 2" />
  </svg>
)

// Developer API Background - Code/Terminal abstract pattern
export const DevApiBg = ({ className }: VisualizationProps) => (
  <svg
    viewBox="0 0 400 300"
    className={cn("absolute inset-0 w-full h-full opacity-20", className)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Code Blocks */}
    <rect x="60" y="60" width="120" height="80" rx="4" className="stroke-primary/30" strokeWidth="1" fill="none" />
    <line x1="70" y1="85" x2="150" y2="85" className="stroke-primary/20" strokeWidth="1" />
    <line x1="70" y1="105" x2="130" y2="105" className="stroke-primary/20" strokeWidth="1" />
    <line x1="70" y1="125" x2="140" y2="125" className="stroke-primary/20" strokeWidth="1" />
    
    <rect x="220" y="100" width="120" height="80" rx="4" className="stroke-primary/30" strokeWidth="1" fill="none" />
    <line x1="230" y1="125" x2="310" y2="125" className="stroke-primary/20" strokeWidth="1" />
    <line x1="230" y1="145" x2="290" y2="145" className="stroke-primary/20" strokeWidth="1" />
    <line x1="230" y1="165" x2="300" y2="165" className="stroke-primary/20" strokeWidth="1" />
    
    {/* API Endpoints */}
    <circle cx="140" cy="200" r="15" className="fill-primary/20" />
    <text x="140" y="205" textAnchor="middle" className="fill-primary/40" fontSize="10">GET</text>
    <text x="140" y="230" textAnchor="middle" className="fill-primary/40 text-[8px]">Request</text>
    
    <circle cx="260" cy="220" r="15" className="fill-primary/20" />
    <text x="260" y="225" textAnchor="middle" className="fill-primary/40" fontSize="10">POST</text>
    <text x="260" y="245" textAnchor="middle" className="fill-primary/40 text-[8px]">Submit</text>
    
    {/* Connection Lines */}
    <line x1="120" y1="140" x2="140" y2="185" className="stroke-primary/20" strokeWidth="1" strokeDasharray="3 3" />
    <line x1="280" y1="180" x2="260" y2="205" className="stroke-primary/20" strokeWidth="1" strokeDasharray="3 3" />
    
    {/* Terminal Prompt */}
    <rect x="80" y="240" width="240" height="40" rx="2" className="fill-primary/10" />
    <line x1="90" y1="255" x2="100" y2="255" className="stroke-primary/30" strokeWidth="2" />
    <line x1="90" y1="270" x2="300" y2="270" className="stroke-primary/20" strokeWidth="1" />
  </svg>
)

// Multilingual Background - Abstract globe/connectivity waves
export const MultilingualBg = ({ className }: VisualizationProps) => (
  <svg
    viewBox="0 0 400 300"
    className={cn("absolute inset-0 w-full h-full opacity-20", className)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Globe Circle */}
    <circle cx="200" cy="150" r="80" className="stroke-chart-4/30" strokeWidth="2" fill="none" />
    <circle cx="200" cy="150" r="60" className="stroke-chart-4/20" strokeWidth="1" fill="none" />
    
    {/* Latitude Lines */}
    <ellipse cx="200" cy="120" rx="60" ry="15" className="stroke-chart-4/20" strokeWidth="1" fill="none" />
    <ellipse cx="200" cy="150" rx="60" ry="15" className="stroke-chart-4/20" strokeWidth="1" fill="none" />
    <ellipse cx="200" cy="180" rx="60" ry="15" className="stroke-chart-4/20" strokeWidth="1" fill="none" />
    
    {/* Longitude Lines */}
    <path
      d="M 140 150 Q 200 120, 260 150"
      className="stroke-chart-4/20"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M 140 150 Q 200 180, 260 150"
      className="stroke-chart-4/20"
      strokeWidth="1"
      fill="none"
    />
    
    {/* Language Nodes */}
    <circle cx="120" cy="100" r="8" className="fill-chart-4/30" />
    <text x="120" y="85" textAnchor="middle" className="fill-chart-4 text-[10px] font-medium opacity-60">EN</text>
    <circle cx="280" cy="100" r="8" className="fill-chart-4/30" />
    <text x="280" y="85" textAnchor="middle" className="fill-chart-4 text-[10px] font-medium opacity-60">ES</text>
    <circle cx="120" cy="200" r="8" className="fill-chart-4/30" />
    <text x="120" y="225" textAnchor="middle" className="fill-chart-4 text-[10px] font-medium opacity-60">MS</text>
    <circle cx="280" cy="200" r="8" className="fill-chart-4/30" />
    <text x="280" y="225" textAnchor="middle" className="fill-chart-4 text-[10px] font-medium opacity-60">JP</text>
    
    {/* Connection Waves */}
    <path
      d="M 120 100 Q 200 150, 280 100"
      className="stroke-chart-4/15"
      strokeWidth="1.5"
      fill="none"
      strokeDasharray="4 4"
    />
    <path
      d="M 120 200 Q 200 150, 280 200"
      className="stroke-chart-4/15"
      strokeWidth="1.5"
      fill="none"
      strokeDasharray="4 4"
    />
  </svg>
)

// Due Diligence Visualization - Document scanning/validation abstract
export const DueDiligenceVisual = ({ className }: VisualizationProps) => (
  <svg
    viewBox="0 0 400 300"
    className={cn("w-full h-full", className)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Document Base */}
    <rect x="120" y="40" width="160" height="220" rx="4" className="stroke-primary fill-background" strokeWidth="2" />
    <text x="200" y="60" textAnchor="middle" className="fill-primary text-[10px] font-bold opacity-80">REPORT</text>
    
    {/* Document Lines */}
    <line x1="140" y1="70" x2="260" y2="70" className="stroke-primary/30" strokeWidth="2" />
    <line x1="140" y1="90" x2="240" y2="90" className="stroke-primary/30" strokeWidth="2" />
    <line x1="140" y1="110" x2="260" y2="110" className="stroke-primary/30" strokeWidth="2" />
    <line x1="140" y1="130" x2="220" y2="130" className="stroke-primary/30" strokeWidth="2" />
    
    {/* Scanning Effect */}
    <rect x="110" y="150" width="180" height="2" className="fill-primary animate-pulse" />
    <path
      d="M 110 150 L 290 150 L 290 180 L 110 180 Z"
      className="fill-primary/10"
    />
    
    {/* Verified Stamp/Badge */}
    <circle cx="240" cy="220" r="25" className="fill-background stroke-primary" strokeWidth="2" />
    <path
      d="M 230 220 L 238 228 L 255 210"
      className="stroke-primary"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <text x="240" y="260" textAnchor="middle" className="fill-primary text-[10px] font-bold">ANALYZED</text>
    
    {/* Abstract Background Elements */}
    <circle cx="80" cy="100" r="10" className="fill-primary/10" />
    <circle cx="320" cy="200" r="15" className="fill-primary/10" />
  </svg>
)

// Source Tracing Visualization - Network/Graph spreading from source
export const SourceTracingVisual = ({ className }: VisualizationProps) => (
  <svg
    viewBox="0 0 400 300"
    className={cn("w-full h-full", className)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Main Source Node */}
    <circle cx="200" cy="250" r="20" className="stroke-primary fill-background" strokeWidth="2" />
    <circle cx="200" cy="250" r="8" className="fill-primary" />
    <text x="200" y="285" textAnchor="middle" className="fill-primary text-xs font-bold">ORIGIN</text>
    
    {/* Level 1 Nodes */}
    <circle cx="100" cy="180" r="15" className="stroke-primary/80 fill-background" strokeWidth="2" />
    <circle cx="300" cy="180" r="15" className="stroke-primary/80 fill-background" strokeWidth="2" />
    
    {/* Level 2 Nodes */}
    <circle cx="60" cy="100" r="10" className="stroke-primary/60 fill-background" strokeWidth="1.5" />
    <circle cx="140" cy="100" r="10" className="stroke-primary/60 fill-background" strokeWidth="1.5" />
    <circle cx="260" cy="100" r="10" className="stroke-primary/60 fill-background" strokeWidth="1.5" />
    <circle cx="340" cy="100" r="10" className="stroke-primary/60 fill-background" strokeWidth="1.5" />
    
    {/* Level 3 Nodes (Faint) */}
    <text x="200" y="30" textAnchor="middle" className="fill-primary text-[10px] font-medium opacity-50">SPREAD</text>
    <circle cx="40" cy="40" r="6" className="fill-primary/20" />
    <circle cx="80" cy="40" r="6" className="fill-primary/20" />
    <circle cx="120" cy="40" r="6" className="fill-primary/20" />
    <circle cx="280" cy="40" r="6" className="fill-primary/20" />
    
    {/* Connections */}
    <path d="M 200 230 L 100 195" className="stroke-primary/60" strokeWidth="1.5" />
    <path d="M 200 230 L 300 195" className="stroke-primary/60" strokeWidth="1.5" />
    
    <path d="M 100 165 L 60 110" className="stroke-primary/40" strokeWidth="1" />
    <path d="M 100 165 L 140 110" className="stroke-primary/40" strokeWidth="1" />
    <path d="M 300 165 L 260 110" className="stroke-primary/40" strokeWidth="1" />
    <path d="M 300 165 L 340 110" className="stroke-primary/40" strokeWidth="1" />
    
    {/* Spread Indicators */}
    <circle cx="200" cy="250" r="40" className="stroke-primary/20 animate-ping" strokeWidth="1" />
  </svg>
)

// Data Compliance Visualization - Data filtering/correction abstract
export const DataComplianceVisual = ({ className }: VisualizationProps) => (
  <svg
    viewBox="0 0 400 300"
    className={cn("w-full h-full", className)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Database/Server Stack */}
    <path
      d="M 100 80 L 100 220 C 100 240, 300 240, 300 220 L 300 80"
      className="fill-background/50"
    />
    <ellipse cx="200" cy="80" rx="100" ry="20" className="stroke-primary fill-background" strokeWidth="2" />
    <path d="M 100 80 C 100 100, 300 100, 300 80" className="stroke-primary fill-background/10" strokeWidth="2" />
    
    <path d="M 100 130 C 100 150, 300 150, 300 130" className="stroke-primary/30" strokeWidth="1.5" />
    <path d="M 100 180 C 100 200, 300 200, 300 180" className="stroke-primary/30" strokeWidth="1.5" />
    <path d="M 100 220 C 100 240, 300 240, 300 220" className="stroke-primary" strokeWidth="2" />
    <line x1="100" y1="80" x2="100" y2="220" className="stroke-primary" strokeWidth="2" />
    <line x1="300" y1="80" x2="300" y2="220" className="stroke-primary" strokeWidth="2" />
    <text x="200" y="70" textAnchor="middle" className="fill-primary text-xs font-bold">DATABASE</text>
    
    {/* Data Rows with Status */}
    <rect x="130" y="100" width="140" height="8" rx="2" className="fill-primary/20" />
    <circle cx="290" cy="104" r="4" className="fill-chart-2" />
    
    <rect x="130" y="150" width="140" height="8" rx="2" className="fill-primary/20" />
    <circle cx="290" cy="154" r="4" className="fill-chart-2" />
    
    <rect x="130" y="200" width="140" height="8" rx="2" className="fill-primary/20" />
    <circle cx="290" cy="204" r="4" className="fill-chart-2" />
    
    {/* Filter/Shield Icon Overlay */}
    <circle cx="200" cy="150" r="40" className="fill-background/90 stroke-primary" strokeWidth="2" />
    <path
      d="M 185 150 L 195 160 L 215 140"
      className="stroke-primary"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <text x="200" y="205" textAnchor="middle" className="fill-primary text-[10px] font-bold">CLEANSED</text>
  </svg>
)
