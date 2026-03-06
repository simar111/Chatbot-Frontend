import { Link, useLocation } from "react-router-dom";

const BotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="7" r="4" />
    <line x1="12" y1="11" x2="12" y2="21" />
    <line x1="8" y1="16" x2="16" y2="16" />
  </svg>
);

const UploadNavIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ChatNavIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default function Navbar() {
  const location = useLocation();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(139,92,246,0); }
        }

        @keyframes navFadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
          font-family: 'Sora', sans-serif;
          animation: navFadeDown 0.4s ease forwards;
        }

        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          height: 64px;
          background: rgba(10, 10, 15, 0.82);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 1px 0 rgba(139,92,246,0.05), 0 8px 32px rgba(0,0,0,0.4);
        }

        /* Brand */
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .brand-icon {
          width: 36px; height: 36px;
          border-radius: 11px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          display: flex; align-items: center; justify-content: center;
          color: white;
          box-shadow: 0 4px 16px rgba(124,58,237,0.45);
          animation: pulseGlow 3s ease-in-out infinite;
          flex-shrink: 0;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }

        .brand-name {
          font-size: 15px;
          font-weight: 700;
          color: #f1f0ff;
          letter-spacing: -0.02em;
        }

        .brand-sub {
          font-size: 10px;
          color: rgba(255,255,255,0.28);
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.06em;
          margin-top: 2px;
        }

        /* Nav links */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          color: rgba(255,255,255,0.45);
          transition: color 0.2s, background 0.2s;
          letter-spacing: 0.01em;
          border: 1px solid transparent;
        }

        .nav-link:hover {
          color: rgba(255,255,255,0.85);
          background: rgba(255,255,255,0.05);
        }

        .nav-link.active {
          color: #c4b5fd;
          background: rgba(139,92,246,0.12);
          border-color: rgba(139,92,246,0.25);
        }

        .nav-link.active .nav-dot {
          opacity: 1;
          transform: scale(1);
        }

        .nav-link-icon {
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .nav-link:hover .nav-link-icon,
        .nav-link.active .nav-link-icon {
          opacity: 1;
        }

        /* Active indicator dot */
        .nav-dot {
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%) scale(0);
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #a78bfa;
          opacity: 0;
          transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 0 6px rgba(167,139,250,0.8);
        }

        /* Right badge */
        .nav-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          padding: 4px 10px;
          border-radius: 20px;
          background: rgba(139,92,246,0.12);
          border: 1px solid rgba(139,92,246,0.22);
          color: #a78bfa;
          letter-spacing: 0.05em;
          margin-left: 8px;
        }

        .status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px rgba(34,197,94,0.7);
          margin-right: 2px;
          display: inline-block;
          animation: pulse-green 2s ease-in-out infinite;
        }

        @keyframes pulse-green {
          0%,100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <nav className="navbar">
        <div className="navbar-inner">
          {/* Brand */}
          <Link to="/" className="brand">
            <div className="brand-icon">
              <BotIcon />
            </div>
            <div className="brand-text">
              <span className="brand-name">AI PDF Chatbot</span>
              <span className="brand-sub">POWERED BY AI</span>
            </div>
          </Link>

          {/* Links */}
          <div className="nav-links">
            <Link to="/" className={`nav-link${location.pathname === "/" ? " active" : ""}`}>
              <span className="nav-link-icon"><UploadNavIcon /></span>
              Upload
              <span className="nav-dot" />
            </Link>
            <Link to="/chat" className={`nav-link${location.pathname === "/chat" ? " active" : ""}`}>
              <span className="nav-link-icon"><ChatNavIcon /></span>
              Chat
              <span className="nav-dot" />
            </Link>

            <div className="nav-badge">
              <span className="status-dot" />
              Online
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}