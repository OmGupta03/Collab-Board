import { useState } from "react";
import { X, Upload } from "lucide-react";
import { BORDER, TMAIN, TSUB, BG } from "./constants";

export default function FileShareModal({ file, onCancel, onConfirm, uploading }) {
  const [tag, setTag] = useState("General");
  const [remark, setRemark] = useState("");

  if (!file) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
      <div className="rcard" style={{ background: BG, width: 400, borderRadius: 12, padding: "24px 28px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", position: "relative" }}>
        
        <button onClick={onCancel} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: TSUB }}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: 20, fontWeight: 800, color: TMAIN, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <Upload size={20} color="#8B5CF6" /> Upload File
        </h2>
        <p style={{ fontSize: 13, color: TSUB, marginBottom: 20 }}>
          Uploading: <strong>{file.name}</strong>
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: TMAIN, marginBottom: 6 }}>Tag as</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["General", "Note", "Assignment"].map(t => (
              <button key={t} onClick={() => setTag(t)} style={{
                flex: 1, padding: "8px 0", borderRadius: 6,
                border: tag === t ? "1.5px solid #8B5CF6" : `1.5px solid ${BORDER}`,
                background: tag === t ? "#EDE9FE" : "#FFF",
                color: tag === t ? "#6D3FCC" : TSUB,
                fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {(tag === "Note" || tag === "Assignment") && (
          <div style={{ marginBottom: 24 }} className="slide-in">
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: TMAIN, marginBottom: 6 }}>Remark</label>
            <textarea 
              value={remark} 
              onChange={e => setRemark(e.target.value)} 
              placeholder={`Add a remark for this ${tag.toLowerCase()}...`}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#FFF", fontSize: 13, fontFamily: "inherit", resize: "vertical", minHeight: 60 }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px 0", borderRadius: 8, background: "#F5F2EE", border: "none", color: TMAIN, fontWeight: 700, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={() => onConfirm(tag, remark)} disabled={uploading} style={{ flex: 1, padding: "10px 0", borderRadius: 8, background: "#8B5CF6", border: "none", color: "#FFF", fontWeight: 700, cursor: uploading ? "wait" : "pointer", opacity: uploading ? 0.7 : 1 }}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
