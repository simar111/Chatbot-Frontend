/**
 * ChatWidget — Reusable Floating AI Chat Component
 *
 * USAGE:
 *   import ChatWidget from "./ChatWidget";
 *   <ChatWidget apiUrl="http://localhost:5000" accentColor="#7c3aed" title="AI Assistant" />
 *
 * PROPS:
 *   apiUrl       — backend base URL         (default: "http://localhost:5000")
 *   title        — header title             (default: "AI Assistant")
 *   subtitle     — header subtitle          (default: auto)
 *   accentColor  — primary brand color      (default: "#7c3aed")
 *   accentColor2 — gradient second color    (default: "#4f46e5")
 *   position     — "bottom-right"|"bottom-left" (default: "bottom-right")
 *   welcomeText  — fallback welcome msg     (default: fetched from /status)
 */

import { useState, useRef, useEffect } from "react";
import axios from "axios";

/* ─── Icons ──────────────────────────────────────────────────────────── */
const BotIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="7" r="4" />
    <line x1="12" y1="11" x2="12" y2="21" />
    <line x1="8" y1="16" x2="16" y2="16" />
  </svg>
);
const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const CloseIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const SparkleIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
    <path d="M19 16L19.75 18.25L22 19L19.75 19.75L19 22L18.25 19.75L16 19L18.25 18.25L19 16Z" opacity="0.6" />
    <path d="M5 3L5.5 4.5L7 5L5.5 5.5L5 7L4.5 5.5L3 5L4.5 4.5L5 3Z" opacity="0.5" />
  </svg>
);

/* ─── Typing Dots ────────────────────────────────────────────────────── */
const TypingDots = ({ color }) => (
  <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "3px 0" }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{
        width: "7px", height: "7px", borderRadius: "50%",
        background: color || "rgba(139,92,246,0.85)",
        animation: "cw-bounce 1.2s ease-in-out infinite",
        animationDelay: `${i * 0.18}s`,
      }} />
    ))}
  </div>
);

/* ─── Global styles (injected once) ─────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  @keyframes cw-bounce {
    0%,60%,100% { transform:translateY(0); opacity:.35; }
    30%          { transform:translateY(-6px); opacity:1; }
  }
  @keyframes cw-fadeUp {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes cw-popIn {
    0%   { opacity:0; transform:scale(0.82) translateY(20px); }
    65%  { transform:scale(1.02) translateY(-3px); }
    100% { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes cw-popOut {
    from { opacity:1; transform:scale(1) translateY(0); }
    to   { opacity:0; transform:scale(0.86) translateY(16px); }
  }
  @keyframes cw-pulse {
    0%,100% { box-shadow:0 0 0 0 var(--cw-a30); }
    50%      { box-shadow:0 0 0 12px transparent; }
  }
  @keyframes cw-fabPop {
    0%   { transform:scale(0.4); opacity:0; }
    70%  { transform:scale(1.1); }
    100% { transform:scale(1); opacity:1; }
  }
  @keyframes cw-ping {
    0%   { transform:scale(1); opacity:.6; }
    100% { transform:scale(2.4); opacity:0; }
  }
  @keyframes cw-notif {
    0%   { opacity:0; transform:translateX(12px) scale(.95); }
    12%  { opacity:1; transform:translateX(0) scale(1); }
    80%  { opacity:1; transform:translateX(0) scale(1); }
    100% { opacity:0; transform:translateX(8px) scale(.97); }
  }
  @keyframes cw-greenPulse {
    0%,100% { opacity:1; }
    50%      { opacity:.4; }
  }

  /* ── Wrapper ── */
  .cw-wrap {
    position: fixed;
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 14px;
    font-family: 'Sora', sans-serif;
  }
  .cw-wrap.br { bottom:28px; right:28px; align-items:flex-end; }
  .cw-wrap.bl { bottom:28px; left:28px;  align-items:flex-start; }

  /* ── FAB ── */
  .cw-fab {
    position: relative;
    width: 60px; height: 60px;
    border-radius: 20px;
    border: none;
    background: linear-gradient(140deg, var(--cw-a1), var(--cw-a2));
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    box-shadow: 0 8px 30px var(--cw-a40), 0 2px 10px rgba(0,0,0,.35);
    animation: cw-fabPop .45s cubic-bezier(.34,1.56,.64,1) forwards,
               cw-pulse 3.5s ease-in-out 1.5s infinite;
    transition: transform .18s, box-shadow .18s;
    flex-shrink: 0;
  }
  .cw-fab:hover { transform:scale(1.09) translateY(-2px); box-shadow:0 14px 38px var(--cw-a50), 0 2px 10px rgba(0,0,0,.35); }
  .cw-fab:active { transform:scale(.94); }
  .cw-fab-ping {
    position:absolute; inset:0; border-radius:20px;
    background:var(--cw-a1);
    animation:cw-ping 2.5s ease-out 2s infinite;
    pointer-events:none;
  }

  /* ── Notif bubble ── */
  .cw-notif {
    max-width: 230px;
    background: rgba(14,14,22,.96);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 14px;
    padding: 11px 15px;
    font-size: 12.5px; line-height: 1.5;
    color: rgba(255,255,255,.78);
    backdrop-filter: blur(20px);
    box-shadow: 0 10px 30px rgba(0,0,0,.45);
    animation: cw-notif 5s ease forwards;
    pointer-events: none;
    user-select: none;
  }

  /* ── Window shell ── */
  .cw-win {
    width: 400px;
    /* 
      Height uses calc so it never overflows the viewport.
      max-height caps at 620px on large screens,
      on small screens it uses 90vh so it always fits.
    */
    height: min(620px, calc(100vh - 110px));
    border-radius: 22px;
    display: flex;
    flex-direction: column;
    overflow: hidden;                    /* clips border-radius only */
    background: #0d0d18;
    border: 1px solid rgba(255,255,255,.08);
    box-shadow:
      0 0 0 1px var(--cw-a10),
      0 32px 80px rgba(0,0,0,.7),
      inset 0 1px 0 rgba(255,255,255,.05);
  }
  .cw-win.open  { animation: cw-popIn  .38s cubic-bezier(.34,1.36,.64,1) forwards; }
  .cw-win.close { animation: cw-popOut .22s ease forwards; }

  /* ── Header (fixed height, never shrinks) ── */
  .cw-hdr {
  
    flex: 0 0 auto;
    padding: 15px 16px;
    display: flex;
    align-items: center;
    gap: 11px;
    border-bottom: 1px solid rgba(255,255,255,.07);
    background: linear-gradient(135deg, var(--cw-a12) 0%, transparent 100%);
  }
  .cw-hdr-avatar {
    position: relative;
    width: 40px; height: 40px; flex-shrink: 0;
    border-radius: 13px;
    background: linear-gradient(135deg, var(--cw-a1), var(--cw-a2));
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    box-shadow: 0 4px 18px var(--cw-a40);
  }
  .cw-hdr-dot {
    position: absolute; bottom:-2px; right:-2px;
    width:11px; height:11px; border-radius:50%;
    background:#22c55e;
    border: 2px solid #0d0d18;
    box-shadow: 0 0 7px rgba(34,197,94,.65);
    animation: cw-greenPulse 2.5s ease-in-out infinite;
  }
  .cw-hdr-text { flex:1; min-width:0; }
  .cw-hdr-title {
    font-size:14px; font-weight:600; color:#f0eeff;
    letter-spacing:-.015em;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .cw-hdr-sub {
    font-size:11px; color:#22c55e; margin-top:2px; letter-spacing:.01em;
  }
  .cw-hdr-close {
    width:30px; height:30px; border-radius:9px; border:none;
    background:rgba(255,255,255,.06); color:rgba(255,255,255,.45);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; flex-shrink:0;
    transition:background .15s, color .15s;
  }
  .cw-hdr-close:hover { background:rgba(239,68,68,.15); color:#f87171; }

  /* ── Messages area (the ONLY scrollable zone) ── */
  .cw-msgs {
    flex: 1 1 0;          /* grows to fill remaining space */
    min-height: 0;        /* CRITICAL — allows flex child to shrink below content size */
    overflow-y: auto;
    overflow-x: hidden;
    padding: 18px 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .cw-msgs::-webkit-scrollbar { width:4px; }
  .cw-msgs::-webkit-scrollbar-track { background:transparent; }
  .cw-msgs::-webkit-scrollbar-thumb { background:var(--cw-a30); border-radius:4px; }
  .cw-msgs::-webkit-scrollbar-thumb:hover { background:var(--cw-a50); }

  /* ── Message row ── */
  .cw-row {
    display:flex; align-items:flex-end; gap:9px;
    animation: cw-fadeUp .28s ease forwards;
  }
  .cw-row.u { flex-direction:row-reverse; }

  .cw-mavatar {
    width:28px; height:28px; border-radius:9px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-size:9.5px; font-weight:700;
  }
  .cw-mavatar.b {
    background:linear-gradient(135deg, var(--cw-a1), var(--cw-a2));
    color:#fff; box-shadow:0 2px 10px var(--cw-a30);
  }
  .cw-mavatar.u {
    background:linear-gradient(135deg,#1d4ed8,#0ea5e9);
    color:#fff;
  }

  .cw-mbody {
    max-width:78%;
    display:flex; flex-direction:column; gap:4px;
  }
  .cw-row.u .cw-mbody { align-items:flex-end; }

  .cw-bubble {
    padding:10px 14px;
    border-radius:16px;
    font-size:13.5px; line-height:1.6;
    word-break:break-word;
    white-space:pre-wrap;        /* preserves newlines in long answers */
  }
  .cw-bubble.b {
    background:rgba(255,255,255,.055);
    border:1px solid rgba(255,255,255,.09);
    color:#e4e2ff;
    border-bottom-left-radius:4px;
  }
  .cw-bubble.u {
    background:linear-gradient(135deg, var(--cw-a1), var(--cw-a2));
    color:#fff;
    border-bottom-right-radius:4px;
    box-shadow:0 4px 18px var(--cw-a35);
    border:1px solid rgba(255,255,255,.12);
  }
  .cw-ts {
    font-size:10px; color:rgba(255,255,255,.2);
    font-family:'JetBrains Mono',monospace;
    padding:0 4px;
  }

  /* Typing indicator row */
  .cw-typing {
    display:flex; align-items:flex-end; gap:9px;
    animation:cw-fadeUp .25s ease forwards;
  }
  .cw-typing-bbl {
    padding:11px 14px;
    background:rgba(255,255,255,.055);
    border:1px solid rgba(255,255,255,.09);
    border-radius:16px; border-bottom-left-radius:4px;
  }

  /* ── Input zone (fixed height, never shrinks) ── */
  .cw-inp-zone {
    flex: 0 0 auto;
    padding: 12px 16px 14px;
    border-top: 1px solid rgba(255,255,255,.07);
    background: rgba(0,0,0,.3);
  }
  .cw-inp-row {
    display:flex; align-items:flex-end; gap:10px;
    background:rgba(255,255,255,.04);
    border:1px solid rgba(255,255,255,.09);
    border-radius:14px;
    padding:9px 9px 9px 15px;
    transition:border-color .2s, box-shadow .2s;
  }
  .cw-inp-row:focus-within {
    border-color:var(--cw-a50);
    box-shadow:0 0 0 3px var(--cw-a08);
  }
  .cw-textarea {
    flex:1; background:transparent; border:none; outline:none;
    font-family:'Sora',sans-serif; font-size:13.5px; color:#e4e2ff;
    resize:none; line-height:1.5;
    max-height:90px;
    min-height:22px;
  }
  .cw-textarea::placeholder { color:rgba(255,255,255,.22); }
  .cw-send-btn {
    width:34px; height:34px; border-radius:11px; border:none; flex-shrink:0;
    background:linear-gradient(135deg, var(--cw-a1), var(--cw-a2));
    color:#fff;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer;
    box-shadow:0 3px 12px var(--cw-a40);
    transition:transform .15s, box-shadow .15s, opacity .15s;
    align-self:flex-end;
    margin-bottom:1px;
  }
  .cw-send-btn:hover:not(:disabled) { transform:scale(1.09); box-shadow:0 5px 18px var(--cw-a50); }
  .cw-send-btn:active:not(:disabled) { transform:scale(.93); }
  .cw-send-btn:disabled { opacity:.3; cursor:not-allowed; transform:none; }
  .cw-hint {
    text-align:center; font-size:10px;
    color:rgba(255,255,255,.12);
    margin-top:8px;
    font-family:'JetBrains Mono',monospace;
    letter-spacing:.02em;
  }

  /* ── Footer branding ── */
  .cw-footer {
    flex:0 0 auto;
    text-align:center;
    font-size:10px; color:rgba(255,255,255,.1);
    font-family:'JetBrains Mono',monospace;
    letter-spacing:.05em;
    padding:6px 16px 10px;
    border-top:1px solid rgba(255,255,255,.04);
  }
`;

let _injected = false;
function injectStyles() {
  if (_injected) return;
  const s = document.createElement("style");
  s.innerHTML = STYLES;
  document.head.appendChild(s);
  _injected = true;
}

/* ─── Component ──────────────────────────────────────────────────────── */
export default function ChatWidget({
  apiUrl       = "http://localhost:5000",
  title        = "AI Assistant",
  subtitle     = "● Online · Ready to help",
  accentColor  = "#7c3aed",
  accentColor2 = "#4f46e5",
  position     = "bottom-right",
  welcomeText  = "Hello! How can I help you today?",
}) {
  const [open, setOpen]         = useState(false);
  const [closing, setClosing]   = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showNotif, setShowNotif] = useState(true);
  const [notifText, setNotifText] = useState("👋 Ask me anything!");

  const endRef   = useRef(null);
  const inputRef = useRef(null);
  const msgsRef  = useRef(null);

  // Inject CSS once
  useEffect(() => { injectStyles(); }, []);

  // CSS variable map for theming
  const cssVars = {
    "--cw-a1":  accentColor,
    "--cw-a2":  accentColor2,
    "--cw-a08": accentColor + "14",
    "--cw-a10": accentColor + "1a",
    "--cw-a12": accentColor + "1f",
    "--cw-a30": accentColor + "4d",
    "--cw-a35": accentColor + "59",
    "--cw-a40": accentColor + "66",
    "--cw-a50": accentColor + "80",
  };

  // Fetch welcome message on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(apiUrl + "/status");
        const msg = res.data.welcomeMessage || welcomeText;
        setMessages([{ role: "bot", text: msg, ts: now() }]);
        setNotifText(msg.slice(0, 72) + (msg.length > 72 ? "…" : ""));
      } catch {
        setMessages([{ role: "bot", text: welcomeText, ts: now() }]);
      }
    })();
    const t = setTimeout(() => setShowNotif(false), 5500);
    return () => clearTimeout(t);
  }, [apiUrl]);

  // Auto-scroll to bottom whenever messages or typing changes
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when widget opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 350);
  }, [open]);

  const now = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const openWidget = () => {
    setClosing(false);
    setOpen(true);
    setShowNotif(false);
  };

  const closeWidget = () => {
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); }, 220);
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const text = input.trim();

    setMessages((p) => [...p, { role: "user", text, ts: now() }]);
    setInput("");
    setIsTyping(true);

    const history = messages.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    }));

    try {
      const res = await axios.post(apiUrl + "/chat", { question: text, history });
      setMessages((p) => [...p, { role: "bot", text: res.data.answer, ts: now() }]);
    } catch {
      setMessages((p) => [
        ...p,
        { role: "bot", text: "Something went wrong. Please try again.", ts: now() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-resize textarea as user types
  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 90) + "px";
  };

  const posClass = position === "bottom-left" ? "bl" : "br";

  return (
    <div className={`cw-wrap ${posClass}`} style={cssVars}>

      {/* Notification bubble */}
      {showNotif && !open && (
        <div className="cw-notif">{notifText}</div>
      )}

      {/* Chat window */}
      {(open || closing) && (
        <div className={`cw-win ${closing ? "close" : "open"}`}>

          {/* Header */}
          <div className="cw-hdr">
            <div className="cw-hdr-avatar">
              <BotIcon size={17} />
              <div className="cw-hdr-dot" />
            </div>
            <div className="cw-hdr-text">
              <div className="cw-hdr-title">{title}</div>
              <div className="cw-hdr-sub">{subtitle}</div>
            </div>
            <button className="cw-hdr-close" onClick={closeWidget} title="Close">
              <CloseIcon size={15} />
            </button>
          </div>

          {/* ── Messages (scrollable) ── */}
          <div className="cw-msgs" ref={msgsRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`cw-row ${msg.role === "user" ? "u" : ""}`}>
                <div className={`cw-mavatar ${msg.role === "user" ? "u" : "b"}`}>
                  {msg.role === "bot" ? <BotIcon size={13} /> : "You"}
                </div>
                <div className="cw-mbody">
                  <div className={`cw-bubble ${msg.role === "user" ? "u" : "b"}`}>
                    {msg.text}
                  </div>
                  <span className="cw-ts">{msg.ts}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="cw-typing">
                <div className="cw-mavatar b"><BotIcon size={13} /></div>
                <div className="cw-typing-bbl">
                  <TypingDots color={accentColor + "cc"} />
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={endRef} style={{ height: "1px", flexShrink: 0 }} />
          </div>

          {/* ── Input ── */}
          <div className="cw-inp-zone">
            <div className="cw-inp-row">
              <textarea
                ref={inputRef}
                className="cw-textarea"
                rows={1}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKey}
                placeholder="Ask me anything…"
              />
              <button
                className="cw-send-btn"
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
              >
                <SendIcon />
              </button>
            </div>
            <div className="cw-hint">↵ Enter to send · Shift+↵ new line</div>
          </div>

          {/* Footer */}
          <div className="cw-footer">POWERED BY AI · PDF ASSISTANT</div>

        </div>
      )}

      {/* FAB button */}
      <button
        className="cw-fab"
        onClick={open ? closeWidget : openWidget}
        title={open ? "Close chat" : "Open chat"}
      >
        <div className="cw-fab-ping" />
        {open ? <CloseIcon size={20} /> : <SparkleIcon size={25} />}
      </button>

    </div>
  );
}