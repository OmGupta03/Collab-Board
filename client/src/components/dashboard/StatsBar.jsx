// import { Users, Layout, Clock, Star } from "lucide-react";

// const BORDER = "#EAE4DC", TSUB = "#9A8F82", TMAIN = "#1E1A14";

// export default function StatsBar({ rooms, user }) {
//   const hosted  = rooms.filter(r => r.hostId?._id === user?._id || r.hostId === user?._id).length;
//   const joined  = rooms.length - hosted;
//   const recent  = rooms.filter(r => {
//     const diff = Date.now() - new Date(r.updatedAt || r.createdAt).getTime();
//     return diff < 1000 * 60 * 60 * 24 * 7; // last 7 days
//   }).length;

//   const stats = [
//     { icon: <Layout  size={18} strokeWidth={2} />, label: "Total Rooms",   value: rooms.length, color: "#8B5CF6", bg: "#EDE9FE" },
//     { icon: <Star    size={18} strokeWidth={2} />, label: "Rooms Hosted",  value: hosted,        color: "#F97316", bg: "#FFF0E8" },
//     { icon: <Users   size={18} strokeWidth={2} />, label: "Rooms Joined",  value: joined,        color: "#06B6D4", bg: "#E0F7FA" },
//     { icon: <Clock   size={18} strokeWidth={2} />, label: "Active (7d)",   value: recent,        color: "#22C55E", bg: "#DCFCE7" },
//   ];

//   return (
//     <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
//       {stats.map(s => (
//         <div key={s.label} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 6px rgba(0,0,0,.04)" }}>
//           <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>
//             {s.icon}
//           </div>
//           <div>
//             <div style={{ fontSize: 22, fontWeight: 800, color: TMAIN, fontFamily: "'Nunito',sans-serif", lineHeight: 1 }}>{s.value}</div>
//             <div style={{ fontSize: 12, color: TSUB, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }