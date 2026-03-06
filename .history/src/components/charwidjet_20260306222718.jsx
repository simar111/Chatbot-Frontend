/**
 * ChatWidget — Reusable Floating AI Chat Component
 *
 * USAGE:
 *   import ChatWidget from "./ChatWidget";
 *   <ChatWidget apiUrl="http://localhost:5000" title="AI Assistant" />
 *
 * PROPS:
 *   apiUrl       — backend base URL             (default: "http://localhost:5000")
 *   title        — header title                 (default: "AI Assistant")
 *   subtitle     — header subtitle              (default: "● Online · Ready to help")
 *   accentColor  — primary brand color          (default: "#7c3aed")
 *   accentColor2 — gradient second color        (default: "#4f46e5")
 *   position     — "bottom-right"|"bottom-left" (default: "bottom-right")
 *   welcomeText  — fallback welcome msg         (default: fetched from /status)
 */

import { useState, useRef, useEffect } from "react";
import axios from "axios";

/* ─── Icons ───────────────────────────────────────────────────────── */
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
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const SparkleIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
    <path d="M19 16L19.75 18.25L22 19L19.75 19.75L19 22L18.25 19.75L16 19L18.25 18.25L19 16Z" opacity="0.6" />
    <path d="M5 3L5.5 4.5L7 5L5.5 5.5L5 7L4.5 5.5L3 5L4.5 4.5L5 3Z" opacity="0.5" />
  </svg>
);

/* ─── Typing dots ─────────────────────────────────────────────────── */
const TypingDots = ({ color }) => (
  <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "3px 0" }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{
        width: "7px", height: "7px", borderRadius: "50%",
        background: color || "rgba(139,92,246,0.85)",
        animation: "cw-bounce 1.2s ease-in-out infinite",
        animationDelay: `${i * 0.18}s`,
        flexShrink: 0,
      }} />
    ))}
  </div>
);

/* ─── Styles (injected once into <head>) ─────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

@keyframes cw-bounce {
  0%,60%,100% { transform:translateY(0); opacity:.35; }
  30%         { transform:translateY(-6px); opacity:1; }
}
@keyframes cw-fadeUp {
  from { opacity:0; transform:translateY(8px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes cw-popIn {
  0%   { opacity:0; transform:scale(0.84) translateY(18px); }
  65%  { transform:scale(1.018) translateY(-2px); }
  100% { opacity:1; transform:scale(1) translateY(0); }
}
@keyframes cw-popOut {
  from { opacity:1; transform:scale(1) translateY(0); }
  to   { opacity:0; transform:scale(0.87) translateY(14px); }
}
@keyframes cw-pulse {
  0%,100% { box-shadow:0 0 0 0 var(--cwa30); }
  50%      { box-shadow:0 0 0 11px transparent; }
}
@keyframes cw-fabPop {
  0%   { transform:scale(0.3); opacity:0; }
  70%  { transform:scale(1.1); }
  100% { transform:scale(1); opacity:1; }
}
@keyframes cw-ping {
  0%   { transform:scale(1); opacity:.55; }
  100% { transform:scale(2.5); opacity:0; }
}
@keyframes cw-notif {
  0%   { opacity:0; transform:translateX(14px); }
  14%  { opacity:1; transform:translateX(0); }
  78%  { opacity:1; transform:translateX(0); }
  100% { opacity:0; transform:translateX(10px); }
}
@keyframes cw-gp {
  0%,100% { opacity:1; } 50% { opacity:.35; }
}

/* ── Wrapper ── */
.cw-wrap {
  position: fixed;
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-family: 'Sora', sans-serif;
}
.cw-wrap.br { bottom:28px; right:28px; align-items:flex-end; }
.cw-wrap.bl { bottom:28px; left:28px;  align-items:flex-start; }

/* ── FAB ── */
.cw-fab {
  position: relative;
  width: 60px; height: 60px; flex-shrink: 0;
  border-radius: 20px; border: none;
  background: linear-gradient(140deg, var(--cwa1), var(--cwa2));
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 32px var(--cwa40), 0 2px 8px rgba(0,0,0,.35);
  animation: cw-fabPop .45s cubic-bezier(.34,1.56,.64,1) forwards,
             cw-pulse 3.5s ease-in-out 1.5s infinite;
  transition: transform .18s, box-shadow .18s;
}
.cw-fab:hover        { transform:scale(1.09) translateY(-2px); box-shadow:0 14px 40px var(--cwa50), 0 2px 8px rgba(0,0,0,.35); }
.cw-fab:active       { transform:scale(.93); }
.cw-fab-ping         { position:absolute; inset:0; border-radius:20px; background:var(--cwa1); animation:cw-ping 2.5s ease-out 2s infinite; pointer-events:none; }

/* ── Notif bubble ── */
.cw-notif {
  max-width: 235px;
  background: rgba(13,13,20,.96);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 14px;
  padding: 11px 15px;
  font-size: 12.5px; line-height: 1.5;
  color: rgba(255,255,255,.78);
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 32px rgba(0,0,0,.45);
  animation: cw-notif 5.5s ease forwards;
  pointer-events: none;
  user-select: none;
}

/* ═══════════════════════════════════════════════════════════════════
   CHAT WINDOW
   KEY TECHNIQUE:
   - The outer .cw-win has a FIXED pixel height (not min/max)
   - It uses display:flex + flex-direction:column
   - Header, input, footer are flex:0 0 auto (exact size, never shrink)
   - Messages area is flex:1 1 0 with min-height:0 and overflow-y:auto
   This guarantees nothing overflows or clips.
═══════════════════════════════════════════════════════════════════ */
.cw-win {
  width: 400px;
  height: 580px;
  border-radius: 22px;
  display: flex;
  flex-direction: column;
  background: #0d0d18;
  border: 1px solid rgba(255,255,255,.08);
  box-shadow:
    0 0 0 1px var(--cwa10),
    0 30px 80px rgba(0,0,0,.7),
    inset 0 1px 0 rgba(255,255,255,.05);
  /* NO overflow:hidden on outer shell — that would clip the messages */
}
.cw-win.open  { animation: cw-popIn  .38s cubic-bezier(.34,1.36,.64,1) forwards; }
.cw-win.close { animation: cw-popOut .22s ease forwards; }

/* ── Header — fixed, never shrinks ── */
.cw-hdr {
  flex: 0 0 auto;
  padding: 15px 16px;
  display: flex; align-items: center; gap: 11px;
  border-bottom: 1px solid rgba(255,255,255,.07);
  background: linear-gradient(135deg, var(--cwa12) 0%, transparent 100%);
  border-radius: 22px 22px 0 0;
}
.cw-hdr-av {
  position: relative;
  width: 40px; height: 40px; flex-shrink: 0;
  border-radius: 13px;
  background: linear-gradient(135deg, var(--cwa1), var(--cwa2));
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  box-shadow: 0 4px 18px var(--cwa40);
}
.cw-hdr-dot {
  position: absolute; bottom:-2px; right:-2px;
  width: 11px; height: 11px; border-radius: 50%;
  background: #22c55e;
  border: 2px solid #0d0d18;
  box-shadow: 0 0 7px rgba(34,197,94,.65);
  animation: cw-gp 2.5s ease-in-out infinite;
}
.cw-hdr-info { flex:1; min-width:0; }
.cw-hdr-title {
  font-size: 14px; font-weight: 600; color: #f0eeff;
  letter-spacing: -.015em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cw-hdr-sub { font-size: 11px; color: #22c55e; margin-top: 2px; }
.cw-close-btn {
  width: 30px; height: 30px; border-radius: 9px; border: none;
  background: rgba(255,255,255,.06); color: rgba(255,255,255,.45);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
  transition: background .15s, color .15s;
}
.cw-close-btn:hover { background: rgba(239,68,68,.18); color: #f87171; }

/* ── Messages — THE scrollable zone ── */
.cw-msgs {
  flex: 1 1 0;      /* grow to fill space between header and input  */
  min-height: 0;    /* CRITICAL: allows shrinking below content size */
  overflow-y: auto;
  overflow-x: hidden;
  padding: 18px 15px 10px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  scroll-behavior: smooth;
  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: var(--cwa30) transparent;
}
.cw-msgs::-webkit-scrollbar       { width: 4px; }
.cw-msgs::-webkit-scrollbar-track { background: transparent; }
.cw-msgs::-webkit-scrollbar-thumb { background: var(--cwa30); border-radius: 4px; }
.cw-msgs::-webkit-scrollbar-thumb:hover { background: var(--cwa50); }

/* ── Message row ── */
.cw-row { display:flex; align-items:flex-end; gap:9px; animation:cw-fadeUp .28s ease forwards; }
.cw-row.u { flex-direction:row-reverse; }

.cw-av {
  width: 28px; height: 28px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 9.5px; font-weight: 700;
  /* stays at bottom of the bubble column */
  align-self: flex-end;
}
.cw-av.b { background:linear-gradient(135deg,var(--cwa1),var(--cwa2)); color:#fff; box-shadow:0 2px 10px var(--cwa30); }
.cw-av.u { background:linear-gradient(135deg,#1d4ed8,#0ea5e9); color:#fff; }

.cw-mbody {
  /* max-width ensures bubble never takes full row width */
  max-width: calc(100% - 46px);
  display: flex; flex-direction: column; gap: 4px;
}
.cw-row.u .cw-mbody { align-items: flex-end; }

/* ── Bubble ── */
.cw-bubble {
  padding: 11px 14px;
  border-radius: 16px;
  font-size: 13.5px; line-height: 1.65;
  word-break: break-word;
  word-wrap: break-word;
  white-space: pre-wrap;      /* respects newlines in long answers */
  overflow-wrap: break-word;
  /* width:100% so it fills available column, never clips text */
  width: 100%;
  box-sizing: border-box;
}
.cw-bubble.b {
  background: rgba(255,255,255,.055);
  border: 1px solid rgba(255,255,255,.09);
  color: #e4e2ff;
  border-bottom-left-radius: 4px;
}
.cw-bubble.u {
  background: linear-gradient(135deg, var(--cwa1), var(--cwa2));
  color: #fff;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 18px var(--cwa35);
  border: 1px solid rgba(255,255,255,.12);
}
.cw-ts {
  font-size: 10px; color: rgba(255,255,255,.2);
  font-family: 'JetBrains Mono', monospace;
  padding: 0 4px;
  flex-shrink: 0;
}

/* Typing indicator */
.cw-typing { display:flex; align-items:flex-end; gap:9px; animation:cw-fadeUp .25s ease forwards; }
.cw-typing-bbl {
  padding: 11px 14px;
  background: rgba(255,255,255,.055);
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 16px; border-bottom-left-radius: 4px;
}

/* ── Input zone — fixed, never shrinks ── */
.cw-inp-zone {
  flex: 0 0 auto;
  padding: 12px 15px 13px;
  border-top: 1px solid rgba(255,255,255,.07);
  background: rgba(0,0,0,.28);
}
.cw-inp-row {
  display: flex; align-items: flex-end; gap: 10px;
  background: rgba(255,255,255,.045);
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 14px;
  padding: 9px 9px 9px 14px;
  transition: border-color .2s, box-shadow .2s;
}
.cw-inp-row:focus-within {
  border-color: var(--cwa50);
  box-shadow: 0 0 0 3px var(--cwa08);
}
.cw-textarea {
  flex: 1; background: transparent; border: none; outline: none;
  font-family: 'Sora', sans-serif; font-size: 13.5px; color: #e4e2ff;
  resize: none; line-height: 1.5;
  min-height: 22px; max-height: 100px;
  overflow-y: auto;
}
.cw-textarea::placeholder { color: rgba(255,255,255,.22); }
.cw-send {
  width: 34px; height: 34px; border-radius: 11px; border: none; flex-shrink: 0;
  background: linear-gradient(135deg, var(--cwa1), var(--cwa2));
  color: #fff; display: flex; align-items: center; justify-content: center;
  cursor: pointer; align-self: flex-end; margin-bottom: 1px;
  box-shadow: 0 3px 12px var(--cwa40);
  transition: transform .15s, box-shadow .15s, opacity .15s;
}
.cw-send:hover:not(:disabled)   { transform:scale(1.09); box-shadow:0 5px 18px var(--cwa50); }
.cw-send:active:not(:disabled)  { transform:scale(.92); }
.cw-send:disabled                { opacity:.3; cursor:not-allowed; transform:none; }
.cw-hint {
  text-align: center; font-size: 10px;
  color: rgba(255,255,255,.12);
  margin-top: 8px;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: .02em;
}

/* ── Footer — fixed, never shrinks ── */
.cw-footer {
  flex: 0 0 auto;
  text-align: center;
  font-size: 10px; color: rgba(255,255,255,.1);
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: .05em;
  padding: 6px 15px 10px;
  border-top: 1px solid rgba(255,255,255,.04);
  border-radius: 0 0 22px 22px;
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

/* ─── Component ──────────────────────────────────────────────────── */
export default function ChatWidget({
  apiUrl       = "http://localhost:5000",
  title        = "AI Assistant",
  subtitle     = "● Online · Ready to help",
  accentColor  = "#7c3aed",
  accentColor2 = "#4f46e5",
  position     = "bottom-right",
  welcomeText  = "Hello! How can I help you today?",
}) {
  const [open, setOpen]           = useState(false);
  const [closing, setClosing]     = useState(false);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [isTyping, setIsTyping]   = useState(false);
  const [showNotif, setShowNotif] = useState(true);
  const [notifText, setNotifText] = useState("👋 Ask me anything!");

  const endRef   = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { injectStyles(); }, []);

  // CSS custom properties for theming
  const cssVars = {
    "--cwa1":  accentColor,
    "--cwa2":  accentColor2,
    "--cwa08": accentColor + "14",
    "--cwa10": accentColor + "1a",
    "--cwa12": accentColor + "1f",
    "--cwa30": accentColor + "4d",
    "--cwa35": accentColor + "59",
    "--cwa40": accentColor + "66",
    "--cwa50": accentColor + "80",
  };

  // Fetch welcome message
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(apiUrl + "/status");
        const msg = res.data.welcomeMessage || welcomeText;
        setMessages([{ role: "bot", text: msg, ts: now() }]);
        setNotifText(msg.slice(0, 70) + (msg.length > 70 ? "…" : ""));
      } catch {
        setMessages([{ role: "bot", text: welcomeText, ts: now() }]);
      }
    })();
    const t = setTimeout(() => setShowNotif(false), 5500);
    return () => clearTimeout(t);
  }, [apiUrl]);

  // Scroll to latest message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input on open
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
    // reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
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

  const handleInput = (e) => {
    setInput(e.target.value);
    // auto-grow textarea
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
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
            <div className="cw-hdr-av">
              <BotIcon size={17} />
              <div className="cw-hdr-dot" />
            </div>
            <div className="cw-hdr-info">
              <div className="cw-hdr-title">{title}</div>
              <div className="cw-hdr-sub">{subtitle}</div>
            </div>
            <button className="cw-close-btn" onClick={closeWidget}>
              <CloseIcon size={15} />
            </button>
          </div>

          {/* Messages — scrolls independently */}
          <div className="cw-msgs">
            {messages.map((msg, i) => (
              <div key={i} className={`cw-row ${msg.role === "user" ? "u" : ""}`}>
                <div className={`cw-av ${msg.role === "user" ? "u" : "b"}`}>
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
                <div className="cw-av b"><BotIcon size={13} /></div>
                <div className="cw-typing-bbl">
                  <TypingDots color={accentColor + "cc"} />
                </div>
              </div>
            )}

            {/* Invisible scroll anchor */}
            <div ref={endRef} style={{ height: "1px", flexShrink: 0 }} />
          </div>

          {/* Input */}
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
                className="cw-send"
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

      {/* FAB */}
      <button className="cw-fab" onClick={open ? closeWidget : openWidget}>
        <div className="cw-fab-ping" />
        {open ? <CloseIcon size={20} /> : <SparkleIcon size={25} />}
      </button>

    </div>
  );
}