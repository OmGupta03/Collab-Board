import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { roomService } from "../services/roomService.js";
import Navbar from "../components/common/Navbar.jsx";
import { BookOpen, FileText, Download, Plus, Upload, X, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

function MaterialUploadModal({ rooms, activeTab, onClose, onConfirm, uploading }) {
  const [roomId, setRoomId] = useState(rooms[0]?.roomId || "");
  const [remark, setRemark] = useState("");
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);

  // Lock the tag to the active tab if it's Note or Assignment
  const tag = (activeTab === "Note" || activeTab === "Assignment") ? activeTab : "Note";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
      <div className="rcard" style={{ background: "#F5F0EB", width: 400, borderRadius: 12, padding: "24px 28px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", position: "relative" }}>
        
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#2D1B69", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Upload size={20} color="#8B5CF6" /> Upload {tag}
        </h2>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B69", marginBottom: 6 }}>Select Room / Class</label>
          <select value={roomId} onChange={e => setRoomId(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #D1D5DB", background: "#FFF", fontSize: 14 }}>
            {rooms.map(r => <option key={r.roomId} value={r.roomId}>{r.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B69", marginBottom: 6 }}>File</label>
          <input type="file" ref={fileInputRef} hidden onChange={e => setFile(e.target.files[0])} />
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => fileInputRef.current?.click()} style={{ padding: "8px 16px", borderRadius: 8, background: "#FFF", border: "1px solid #D1D5DB", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Choose File</button>
            <span style={{ fontSize: 13, color: "#4B5563" }}>{file ? file.name : "No file chosen"}</span>
          </div>
        </div>

        <div style={{ marginBottom: 24 }} className="slide-in">
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#2D1B69", marginBottom: 6 }}>Remark</label>
          <textarea 
            value={remark} 
            onChange={e => setRemark(e.target.value)} 
            placeholder={`Add a remark for this ${tag.toLowerCase()}...`}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #D1D5DB", background: "#FFF", fontSize: 13, fontFamily: "inherit", resize: "vertical", minHeight: 60 }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 8, background: "#E5E7EB", border: "none", color: "#374151", fontWeight: 700, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={() => onConfirm(roomId, file, tag, remark)} disabled={uploading || !file || !roomId} style={{ flex: 1, padding: "10px 0", borderRadius: 8, background: "#8B5CF6", border: "none", color: "#FFF", fontWeight: 700, cursor: (uploading || !file || !roomId) ? "not-allowed" : "pointer", opacity: (uploading || !file || !roomId) ? 0.7 : 1 }}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MaterialsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab") || "Note";

  const [materials, setMaterials] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchMaterialsAndRooms = async () => {
    try {
      const [matsData, roomsData] = await Promise.all([
        roomService.getUserMaterials(),
        roomService.getUserRooms()
      ]);
      setMaterials(matsData);
      setRooms(roomsData);
    } catch (error) {
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterialsAndRooms();
  }, []);

  const handleUpload = async (roomId, file, tag, remark) => {
    setUploading(true);
    try {
      await roomService.uploadFile(roomId, file, tag, remark);
      toast.success("Uploaded successfully!");
      setShowUpload(false);
      fetchMaterialsAndRooms();
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Group materials by roomName, specifically for the active tab
  const groupedMaterials = materials.reduce((acc, file) => {
    if (file.tag !== activeTab) return acc;
    if (!acc[file.roomName]) acc[file.roomName] = [];
    acc[file.roomName].push(file);
    return acc;
  }, {});

  const handleDownload = (fileUrl, fileName) => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const baseUrl = apiUrl.replace("/api", "");
    
    // Fix legacy files that were saved with absolute paths
    let safeFileUrl = fileUrl;
    if (fileUrl.includes("uploads/")) {
      const parts = fileUrl.split("uploads/");
      safeFileUrl = "uploads/" + parts[1];
    }

    window.open(`${baseUrl}/${safeFileUrl}`, "_blank");
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab.toLowerCase()}?`)) return;
    try {
      await roomService.deleteFile(fileId);
      toast.success("Deleted successfully");
      fetchMaterialsAndRooms();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const renderFileList = (files, emptyMsg) => {
    if (files.length === 0) return <div style={{ fontSize: 14, color: "#6B7280", fontStyle: "italic" }}>{emptyMsg}</div>;
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(350px,1fr))", gap: 16 }}>
        {files.map(file => (
          <div key={file._id} style={{
            background: file.tag === "Assignment" ? "#FFF4ED" : "#F3F0FF",
            border: `1px solid ${file.tag === "Assignment" ? "#FFD8B8" : "#E2D4FF"}`,
            borderRadius: 8, padding: 16, position: "relative"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ 
                fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 12,
                background: file.tag === "Assignment" ? "#FFEDD5" : "#EDE9FE",
                color: file.tag === "Assignment" ? "#9A3412" : "#6D3FCC"
              }}>
                {file.tag}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handleDownload(file.fileUrl, file.fileName)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }} title="Download">
                  <Download size={18} />
                </button>
                <button onClick={() => handleDelete(file._id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626" }} title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileText size={18} color={file.tag === "Assignment" ? "#EA580C" : "#7C3AED"} />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1F2937", margin: 0, wordBreak: "break-all" }}>{file.fileName}</h3>
              </div>
              
              {file.remark && (
                <div style={{ fontSize: 15, color: "#374151", fontStyle: "italic", fontWeight: 700, background: "rgba(255,255,255,0.6)", padding: "4px 10px", borderRadius: 6 }}>
                  "{file.remark}"
                </div>
              )}
            </div>
            
            <div style={{ marginTop: 12, fontSize: 12, color: "#9CA3AF" }}>
              Uploaded by {file.uploadedBy?.name || "Unknown"}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F0EB",
      backgroundImage: "radial-gradient(circle,#C8B8A2 1.2px,transparent 1.2px)",
      backgroundSize: "24px 24px",
      fontFamily: "'DM Sans',sans-serif",
      color: "#2D1B00"
    }}>
      <style>{`
        @keyframes popIn{from{opacity:0;transform:scale(.88) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .rcard{animation:popIn .3s cubic-bezier(.34,1.56,.64,1) both;}
      `}</style>
      <Navbar />
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "36px 24px 60px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 32, color: "#2D1B69", letterSpacing: "-0.5px", marginBottom: 4 }}>
              {activeTab === "Note" ? "Notes 📝" : "Assignments 🎯"}
            </h1>
            <p style={{ fontFamily: "'Caveat',cursive", fontSize: 18, color: "#7C6B3A", fontWeight: 600 }}>
              Access and manage your {activeTab === "Note" ? "study notes" : "assignments"} here.
            </p>
          </div>
          
          <button onClick={() => setShowUpload(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 8, background: "#8B5CF6", color: "#FFF", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(139,92,246,0.3)", transition: "transform 0.15s" }}>
            <Plus size={18} strokeWidth={2.5} /> Upload {activeTab}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "'Caveat',cursive", fontSize: 20, color: "#7C6B3A" }}>Loading {activeTab.toLowerCase()}s… 📝</div>
        ) : Object.keys(groupedMaterials).length === 0 ? (
           <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "'Caveat',cursive", fontSize: 20, color: "#7C6B3A" }}>No {activeTab.toLowerCase()}s found.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {Object.entries(groupedMaterials).map(([roomName, files]) => {
              return (
                <div key={roomName} style={{ background: "rgba(255,255,255,0.7)", borderRadius: 12, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: "#2D1B69", marginBottom: 20, display: "flex", alignItems: "center", gap: 8, borderBottom: "2px solid rgba(139,92,246,0.1)", paddingBottom: 12 }}>
                    <BookOpen size={24} color="#8B5CF6" /> {roomName}
                  </h2>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {renderFileList(files, `No ${activeTab.toLowerCase()}s uploaded yet.`)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showUpload && <MaterialUploadModal rooms={rooms} activeTab={activeTab} onClose={() => setShowUpload(false)} onConfirm={handleUpload} uploading={uploading} />}
    </div>
  );
}
