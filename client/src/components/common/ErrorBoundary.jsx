import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFF5F5",
          fontFamily: "'DM Sans', sans-serif"
        }}>
          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            textAlign: "center",
            maxWidth: "400px",
            border: "1.5px solid #FFEBEB"
          }}>
            <div style={{
              width: "60px",
              height: "60px",
              background: "#FFF5F5",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              color: "#E53E3E"
            }}>
              <AlertTriangle size={32} />
            </div>
            
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#2D3748", marginBottom: "12px" }}>
              Something went wrong
            </h2>
            
            <p style={{ color: "#718096", fontSize: "14px", lineHeight: "1.6", marginBottom: "30px" }}>
              An unexpected error occurred. Don't worry, your data is safe. Try refreshing the page or going back home.
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  border: "none",
                  background: "#E53E3E",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#C53030"}
                onMouseLeave={e => e.currentTarget.style.background = "#E53E3E"}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              
              <button
                onClick={() => window.location.href = "/"}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1.5px solid #E2E8F0",
                  background: "white",
                  color: "#4A5568",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#F7FAFC"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}
              >
                <Home size={16} />
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
