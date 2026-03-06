/**
 * ChatWidget — Reusable Floating AI Chat Component
 *
 * USAGE on any website/page:
 *   import ChatWidget from "./ChatWidget";
 *   <ChatWidget apiUrl="http://localhost:5000" accentColor="#7c3aed" title="AI Assistant" />
 *
 * PROPS:
 *   apiUrl       — your backend base URL  (default: "http://localhost:5000")
 *   title        — widget header title     (default: "AI Assistant")
 *   subtitle     — header subtitle         (default: "Ask me anything")
 *   accentColor  — primary brand color     (default: "#7c3aed")
 *   position     — "bottom-right" | "bottom-left"  (default: "bottom-right")
 *   welcomeText  — fallback welcome msg    (default: fetched from /status)
 */

import { useState, useRef, useEffect } from "react";
import axios from "axios";

/* ── Icons (inline SVG, zero dependencies) ─────────────────────────── */
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

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const MinimizeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SparkleIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
    <path d="M19 16L19.75 18.25L22 19L19.75 19.75L19 22L18.25 19.75L16 19L18.25 18.25L19 16Z" opacity="0.6" />
    <path d="M5 3L5.5 4.5L7 5L5.5 5.5L5 7L4.5 5.5L3 5L4.5 4.5L5 3Z" opacity="0.5" />
  </svg>
);

/* ── Typing Dots ────────────────────────────────────────────────────── */
const TypingDots = ({ color }) => (
  <div style={{ display: "flex", gap: "4px", alignItems: "center", padding: "2px 0" }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{
        width: "6px", height: "6px", borderRadius: "50%",
        background: color || "rgba(139,92,246,0.8)",
        animation: "cw-bounce 1.2s ease-in-out infinite",
        animationDelay: `${i * 0.16}s`,
      }} />
    ))}
  </div>
);

/* ── CSS injected once ──────────────────────────────────────────────── */
const WIDGET_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  @keyframes cw-bounce {
    0%,60%,100% { transform: translateY(0); opacity: 0.35; }
    30% { transform: translateY(-5px); opacity: 1; }
  }
  @keyframes cw-fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cw-popIn {
    0%   { opacity: 0; transform: scale(0.85) translateY(16px); }
    60%  { transform: scale(1.02) translateY(-2px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes cw-popOut {
    from { opacity: 1; transform: scale(1) translateY(0); }
    to   { opacity: 0; transform: scale(0.88) translateY(12px); }
  }
  @keyframes cw-pulse {
    0%,100% { box-shadow: 0 0 0 0 var(--cw-accent-30); }
    50%      { box-shadow: 0 0 0 10px transparent; }
  }
  @keyframes cw-btnPop {
    0%   { transform: scale(0.5); opacity: 0; }
    70%  { transform: scale(1.08); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes cw-ping {
    0%   { transform: scale(1); opacity: 0.7; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  @keyframes cw-notifSlide {
    0%   { opacity: 0; transform: translateX(10px); }
    15%  { opacity: 1; transform: translateX(0); }
    80%  { opacity: 1; transform: translateX(0); }
    100% { opacity: 0; transform: translateX(10px); }
  }

  .cw-fab-wrap {
    position: fixed;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
    font-family: 'Sora', sans-serif;
  }
  .cw-fab-wrap.bottom-right { bottom: 28px; right: 28px; }
  .cw-fab-wrap.bottom-left  { bottom: 28px; left: 28px; align-items: flex-start; }

  /* FAB Button */
  .cw-fab {
    width: 58px; height: 58px;
    border-radius: 18px;
    border: none;
    background: linear-gradient(135deg, var(--cw-accent), var(--cw-accent2));
    color: white;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    box-shadow: 0 8px 28px var(--cw-accent-40), 0 2px 8px rgba(0,0,0,0.3);
    animation: cw-btnPop 0.4s cubic-bezier(.34,1.56,.64,1) forwards, cw-pulse 3s ease-in-out 1s infinite;
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative;
  }
  .cw-fab:hover {
    transform: scale(1.08) translateY(-2px);
    box-shadow: 0 12px 36px var(--cw-accent-50), 0 2px 8px rgba(0,0,0,0.3);
  }
  .cw-fab:active { transform: scale(0.95); }

  .cw-fab-ping {
    position: absolute;
    inset: 0;
    border-radius: 18px;
    background: var(--cw-accent);
    animation: cw-ping 2s ease-out 2s infinite;
    pointer-events: none;
  }

  /* Notification bubble */
  .cw-notif {
    background: rgba(15,15,25,0.95);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 12.5px;
    color: rgba(255,255,255,0.75);
    max-width: 220px;
    backdrop-filter: blur(16px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    animation: cw-notifSlide 4s ease forwards;
    pointer-events: none;
    line-height: 1.45;
  }

  /* Chat Window */
  .cw-window {
    width: 370px;
    height: 520px;
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: rgba(12, 12, 20, 0.97);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow:
      0 0 0 1px var(--cw-accent-10),
      0 28px 70px rgba(0,0,0,0.65),
      inset 0 1px 0 rgba(255,255,255,0.05);
    backdrop-filter: blur(32px);
  }
  .cw-window.open  { animation: cw-popIn 0.35s cubic-bezier(.34,1.36,.64,1) forwards; }
  .cw-window.close { animation: cw-popOut 0.22s ease forwards; }

  /* Header */
  .cw-header {
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: linear-gradient(135deg, var(--cw-accent-12), transparent);
    flex-shrink: 0;
  }
  .cw-avatar {
    width: 36px; height: 36px;
    border-radius: 11px;
    background: linear-gradient(135deg, var(--cw-accent), var(--cw-accent2));
    display: flex; align-items: center; justify-content: center;
    color: white;
    box-shadow: 0 3px 14px var(--cw-accent-40);
    flex-shrink: 0;
    position: relative;
  }
  .cw-avatar-dot {
    position: absolute;
    bottom: -2px; right: -2px;
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #22c55e;
    border: 2px solid #0c0c14;
    box-shadow: 0 0 6px rgba(34,197,94,0.6);
  }
  .cw-header-info { flex: 1; min-width: 0; }
  .cw-header-title {
    font-size: 13.5px; font-weight: 600;
    color: #f1f0ff; letter-spacing: -0.01em;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .cw-header-sub {
    font-size: 11px; color: #22c55e;
    margin-top: 1px; letter-spacing: 0.01em;
  }
  .cw-header-actions { display: flex; gap: 4px; margin-left: auto; }
  .cw-icon-btn {
    width: 28px; height: 28px;
    border-radius: 8px;
    border: none;
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.45);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .cw-icon-btn:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.85); }

  /* Messages */
  .cw-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scroll-behavior: smooth;
  }
  .cw-messages::-webkit-scrollbar { width: 3px; }
  .cw-messages::-webkit-scrollbar-track { background: transparent; }
  .cw-messages::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); border-radius: 3px; }

  .cw-row {
    display: flex; align-items: flex-end; gap: 8px;
    animation: cw-fadeUp 0.25s ease forwards;
  }
  .cw-row.user { flex-direction: row-reverse; }

  .cw-msg-avatar {
    width: 26px; height: 26px;
    border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .cw-msg-avatar.bot {
    background: linear-gradient(135deg, var(--cw-accent), var(--cw-accent2));
    color: white;
    box-shadow: 0 2px 8px var(--cw-accent-30);
  }
  .cw-msg-avatar.user {
    background: linear-gradient(135deg, #1d4ed8, #0ea5e9);
    color: white;
    font-size: 9px; font-weight: 700;
    font-family: 'Sora', sans-serif;
  }

  .cw-msg-body { max-width: 76%; display: flex; flex-direction: column; gap: 3px; }
  .cw-row.user .cw-msg-body { align-items: flex-end; }

  .cw-bubble {
    padding: 9px 13px;
    border-radius: 14px;
    font-size: 13px; line-height: 1.55;
    word-break: break-word;
  }
  .cw-bubble.bot {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    color: #e2e0ff;
    border-bottom-left-radius: 4px;
  }
  .cw-bubble.user {
    background: linear-gradient(135deg, var(--cw-accent), var(--cw-accent2));
    color: #fff;
    border-bottom-right-radius: 4px;
    box-shadow: 0 3px 14px var(--cw-accent-35);
  }
  .cw-time {
    font-size: 9.5px;
    color: rgba(255,255,255,0.2);
    font-family: 'JetBrains Mono', monospace;
    padding: 0 3px;
  }

  .cw-typing-row { display: flex; align-items: flex-end; gap: 8px; animation: cw-fadeUp 0.25s ease forwards; }
  .cw-typing-bubble {
    padding: 10px 13px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; border-bottom-left-radius: 4px;
  }

  /* Input */
  .cw-input-area {
    padding: 12px 14px 14px;
    border-top: 1px solid rgba(255,255,255,0.06);
    background: rgba(0,0,0,0.25);
    flex-shrink: 0;
  }
  .cw-input-wrap {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 12px;
    padding: 8px 8px 8px 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .cw-input-wrap:focus-within {
    border-color: var(--cw-accent-50);
    box-shadow: 0 0 0 3px var(--cw-accent-08);
  }
  .cw-input {
    flex: 1; background: transparent; border: none; outline: none;
    font-family: 'Sora', sans-serif; font-size: 13px;
    color: #e2e0ff; resize: none; line-height: 1.4; max-height: 80px;
  }
  .cw-input::placeholder { color: rgba(255,255,255,0.2); }
  .cw-send {
    width: 32px; height: 32px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, var(--cw-accent), var(--cw-accent2));
    color: white; display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0;
    box-shadow: 0 3px 10px var(--cw-accent-40);
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
  }
  .cw-send:hover { transform: scale(1.08); box-shadow: 0 4px 14px var(--cw-accent-50); }
  .cw-send:active { transform: scale(0.93); }
  .cw-send:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
  .cw-hint {
    text-align: center; font-size: 10px;
    color: rgba(255,255,255,0.12);
    margin-top: 7px;
    font-family: 'JetBrains Mono', monospace;
  }

  /* Powered by footer */
  .cw-footer {
    text-align: center; font-size: 10px;
    color: rgba(255,255,255,0.1);
    font-family: 'JetBrains Mono', monospace;
    padding: 0 14px 10px;
    letter-spacing: 0.04em;
  }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  const el = document.createElement("style");
  el.innerHTML = WIDGET_STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

/* ── Main Widget Component ──────────────────────────────────────────── */
export default function ChatWidget({
  apiUrl = "http://localhost:5000",
  title = "AI Assistant",
  subtitle = "● Online · Ready to help",
  accentColor = "#7c3aed",
  accentColor2 = "#4f46e5",
  position = "bottom-right",
  welcomeText = "Hello! How can I help you today?",
}) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showNotif, setShowNotif] = useState(true);
  const [notifMsg, setNotifMsg] = useState("👋 Need help? Ask me anything!");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Inject CSS once
  useEffect(() => { injectStyles(); }, []);

  // Set CSS variables for theming
  const cssVars = {
    "--cw-accent": accentColor,
    "--cw-accent2": accentColor2,
    "--cw-accent-08": accentColor + "14",
    "--cw-accent-10": accentColor + "1a",
    "--cw-accent-12": accentColor + "1f",
    "--cw-accent-30": accentColor + "4d",
    "--cw-accent-35": accentColor + "59",
    "--cw-accent-40": accentColor + "66",
    "--cw-accent-50": accentColor + "80",
  };

  // Fetch welcome from /status on mount
  useEffect(() => {
    const fetchWelcome = async () => {
      try {
        const res = await axios.get(apiUrl + "/status");
        const msg = res.data.welcomeMessage || welcomeText;
        setMessages([{ type: "bot", text: msg, time: now() }]);
        setNotifMsg(msg.slice(0, 60) + (msg.length > 60 ? "…" : ""));
      } catch {
        setMessages([{ type: "bot", text: welcomeText, time: now() }]);
      }
    };
    fetchWelcome();

    // Hide notif bubble after 5s
    const t = setTimeout(() => setShowNotif(false), 5000);
    return () => clearTimeout(t);
  }, [apiUrl]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
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
    setTimeout(() => { setOpen(false); setClosing(false); }, 200);
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const text = input.trim();
    setMessages((p) => [...p, { type: "user", text, time: now() }]);
    setInput("");
    setIsTyping(true);

    const history = messages.map((m) => ({
      role: m.type === "user" ? "user" : "assistant",
      content: m.text,
    }));

    try {
      const res = await axios.post(apiUrl + "/chat", { question: text, history });
      setMessages((p) => [...p, { type: "bot", text: res.data.answer, time: now() }]);
    } catch {
      setMessages((p) => [...p, { type: "bot", text: "Something went wrong. Please try again.", time: now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className={`cw-fab-wrap ${position}`} style={cssVars}>

      {/* Notification bubble (shown before first open) */}
      {showNotif && !open && (
        <div className="cw-notif">{notifMsg}</div>
      )}

      {/* Chat Window */}
      {(open || closing) && (
        <div className={`cw-window ${closing ? "close" : "open"}`}>
          {/* Header */}
          <div className="cw-header">
            <div className="cw-avatar">
              <BotIcon size={16} />
              <div className="cw-avatar-dot" />
            </div>
            <div className="cw-header-info">
              <div className="cw-header-title">{title}</div>
              <div className="cw-header-sub">{subtitle}</div>
            </div>
            <div className="cw-header-actions">
              <button className="cw-icon-btn" onClick={closeWidget} title="Minimize">
                <MinimizeIcon />
              </button>
              <button className="cw-icon-btn" onClick={closeWidget} title="Close">
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="cw-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`cw-row ${msg.type}`}>
                <div className={`cw-msg-avatar ${msg.type}`}>
                  {msg.type === "bot" ? <BotIcon size={13} /> : "You"}
                </div>
                <div className="cw-msg-body">
                  <div className={`cw-bubble ${msg.type}`}>{msg.text}</div>
                  <span className="cw-time">{msg.time}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="cw-typing-row">
                <div className="cw-msg-avatar bot"><BotIcon size={13} /></div>
                <div className="cw-typing-bubble">
                  <TypingDots color={accentColor + "cc"} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="cw-input-area">
            <div className="cw-input-wrap">
              <textarea
                ref={inputRef}
                className="cw-input"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask me anything..."
              />
              <button
                className="cw-send"
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
              >
                <SendIcon />
              </button>
            </div>
            <div className="cw-hint">↵ send · shift+↵ new line</div>
          </div>

          {/* Branding */}
          <div className="cw-footer">POWERED BY AI · PDF ASSISTANT</div>
        </div>
      )}

      {/* FAB Toggle Button */}
      <button className="cw-fab" onClick={open ? closeWidget : openWidget} title="Chat with AI">
        <div className="cw-fab-ping" />
        {open ? <CloseIcon /> : <SparkleIcon size={24} />}
      </button>
    </div>
  );
}