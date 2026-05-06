import { Layers, Users, TrendingUp, Star } from "lucide-react";

export default function StatsBar({ rooms, starredCount }) {
  const stats = [
    { 
      icon: <Layers size={18} strokeWidth={2}/>,     
      label: "Total Boards",  
      value: rooms.length,                               
      color: "#8B5CF6", 
      bg: "#EDE9FE" 
    },
    { 
      icon: <Users size={18} strokeWidth={2}/>,      
      label: "Collaborators", 
      value: rooms.reduce((a, r) => a + (r.participants?.length || 0), 0), 
      color: "#EC4899", 
      bg: "#FDF2F8" 
    },
    { 
      icon: <TrendingUp size={18} strokeWidth={2}/>, 
      label: "Active Today",  
      value: rooms.filter(r => r.isActive).length,          
      color: "#22C55E", 
      bg: "#F0FDF4" 
    },
    { 
      icon: <Star size={18} strokeWidth={2}/>,       
      label: "Starred",       
      value: starredCount,                              
      color: "#F59E0B", 
      bg: "#FFFBEB" 
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 36 }}>
      {stats.map((s, i) => (
        <div 
          key={i} 
          className="stcard" 
          style={{ 
            background: s.bg, 
            border: `1.5px solid ${s.color}30`, 
            borderRadius: 16, 
            padding: "16px 20px", 
            boxShadow: `0 3px 14px ${s.color}18`, 
            animationDelay: `${i * .07}s`, 
            display: "flex", 
            alignItems: "center", 
            gap: 14,
            transition: "transform .2s"
          }}
        >
          <div style={{ 
            width: 42, 
            height: 42, 
            borderRadius: 12, 
            background: `${s.color}18`, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: s.color, 
            flexShrink: 0 
          }}>
            {s.icon}
          </div>
          <div>
            <div style={{ 
              fontSize: 24, 
              fontWeight: 900, 
              color: s.color, 
              lineHeight: 1, 
              fontFamily: "'Nunito',sans-serif" 
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#7C6030", marginTop: 2 }}>
              {s.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}