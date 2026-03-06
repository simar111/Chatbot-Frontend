import { useState, useRef, useEffect } from "react";
import axios from "axios";

const BotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="7" r="4" />
    <line x1="12" y1="11" x2="12" y2="21" />
    <line x1="8" y1="16" x2="16" y2="16" />
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const TypingDots = () => (
  <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "4px 2px" }}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "rgba(139,92,246,0.85)",
          animation: "typingBounce 1.2s ease-in-out infinite",
          animationDelay: `${i * 0.18}s`,
        }}
      />
    ))}
  </div>
);

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hey there! I'm your AI assistant. Ask me anything — I'm here to help." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!question.trim()) return;
    const userMsg = { type: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setIsTyping(true);

    try {
      const res = await axios.post("http://localhost:5000/chat", { question });
      const botMsg = { type: "bot", text: res.data.answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [...prev, { type: "bot", text: "Something went wrong. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0a0f;
          font-family: 'Sora', sans-serif;
        }

        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(139,92,246,0); }
        }

        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }

        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(0.95); }
          66% { transform: translate(20px, -15px) scale(1.05); }
        }

        .chat-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #0a0a0f;
          position: relative;
          overflow: hidden;
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        .bg-orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
          top: -100px; left: -100px;
          animation: orb1 12s ease-in-out infinite;
        }

        .bg-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%);
          bottom: -80px; right: -80px;
          animation: orb2 14s ease-in-out infinite;
        }

        .bg-orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%);
          bottom: 30%; right: 20%;
          animation: orb1 18s ease-in-out infinite reverse;
        }

        .chat-window {
        top:20px;
          width: 100%;
          max-width: 720px;
          height: 700px;
          display: flex;
          flex-direction: column;
          background: rgba(15, 15, 25, 0.85);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          backdrop-filter: blur(32px);
          box-shadow:
            0 0 0 1px rgba(139,92,246,0.05),
            0 32px 80px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.05);
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        /* Header */
        .chat-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(139,92,246,0.04);
          flex-shrink: 0;
        }

        .avatar-ring {
          position: relative;
          width: 44px; height: 44px;
          flex-shrink: 0;
        }

        .avatar-bg {
          width: 44px; height: 44px;
          border-radius: 14px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 20px rgba(124,58,237,0.4);
          animation: pulseGlow 3s ease-in-out infinite;
        }

        .status-dot {
          position: absolute;
          bottom: -2px; right: -2px;
          width: 12px; height: 12px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid #0a0a0f;
          box-shadow: 0 0 8px rgba(34,197,94,0.6);
        }

        .header-info h2 {
          font-size: 15px;
          font-weight: 600;
          color: #f1f0ff;
          letter-spacing: -0.01em;
        }

        .header-info p {
          font-size: 12px;
          color: #22c55e;
          margin-top: 1px;
          font-weight: 400;
          letter-spacing: 0.02em;
        }

        .header-badge {
          margin-left: auto;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          padding: 4px 10px;
          border-radius: 20px;
          background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.25);
          color: #a78bfa;
          letter-spacing: 0.05em;
        }

        /* Messages */
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scroll-behavior: smooth;
        }

        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 4px; }

        .message-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          animation: fadeSlideUp 0.3s ease forwards;
        }

        .message-row.user { flex-direction: row-reverse; }

        .msg-avatar {
          width: 30px; height: 30px;
          border-radius: 10px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .msg-avatar.bot {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: white;
          box-shadow: 0 2px 12px rgba(124,58,237,0.3);
        }

        .msg-avatar.user {
          background: linear-gradient(135deg, #1d4ed8, #0ea5e9);
          color: white;
          font-size: 11px;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
        }

        .message-content { max-width: 72%; display: flex; flex-direction: column; gap: 4px; }
        .message-row.user .message-content { align-items: flex-end; }

        .bubble {
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.6;
          word-break: break-word;
          position: relative;
        }

        .bubble.bot {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: #e2e0ff;
          border-bottom-left-radius: 6px;
        }

        .bubble.user {
          background: linear-gradient(135deg, #5b21b6, #4338ca);
          color: #fff;
          border-bottom-right-radius: 6px;
          box-shadow: 0 4px 20px rgba(91,33,182,0.35);
          border: 1px solid rgba(167,139,250,0.2);
        }

        .msg-time {
          font-size: 10px;
          color: rgba(255,255,255,0.25);
          font-family: 'JetBrains Mono', monospace;
          padding: 0 4px;
        }

        .typing-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          animation: fadeSlideUp 0.3s ease forwards;
        }

        .typing-bubble {
          padding: 12px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          border-bottom-left-radius: 6px;
        }

        /* Input area */
        .input-area {
          padding: 16px 20px 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          background: rgba(0,0,0,0.2);
          flex-shrink: 0;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px;
          padding: 10px 10px 10px 18px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .input-wrapper:focus-within {
          border-color: rgba(139,92,246,0.5);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.03);
        }

        .chat-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          color: #e2e0ff;
          resize: none;
          line-height: 1.5;
          max-height: 100px;
        }

        .chat-input::placeholder { color: rgba(255,255,255,0.2); }

        .send-btn {
          width: 38px; height: 38px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(124,58,237,0.4);
        }

        .send-btn:hover { transform: scale(1.06); box-shadow: 0 6px 20px rgba(124,58,237,0.5); }
        .send-btn:active { transform: scale(0.95); }
        .send-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

        .hint-text {
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,0.15);
          margin-top: 10px;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.02em;
        }
      `}</style>

      <div className="chat-container">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />

        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="avatar-ring">
              <div className="avatar-bg">
                <BotIcon />
              </div>
              <div className="status-dot" />
            </div>
            <div className="header-info">
              <h2>AI Assistant</h2>
              <p>● Online · Ready to help</p>
            </div>
            <div className="header-badge">GPT-AGENT</div>
          </div>

          {/* Messages */}
          <div className="messages-area">
            {messages.map((msg, index) => (
              <div key={index} className={`message-row ${msg.type}`}>
                <div className={`msg-avatar ${msg.type}`}>
                  {msg.type === "bot" ? <BotIcon /> : "You"}
                </div>
                <div className="message-content">
                  <div className={`bubble ${msg.type}`}>{msg.text}</div>
                  <span className="msg-time">{formatTime()}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="typing-row">
                <div className="msg-avatar bot">
                  <BotIcon />
                </div>
                <div className="typing-bubble">
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="input-area">
            <div className="input-wrapper">
              <textarea
                ref={inputRef}
                className="chat-input"
                rows={1}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
              />
              <button
                className="send-btn"
                onClick={sendMessage}
                disabled={!question.trim() || isTyping}
              >
                <SendIcon />
              </button>
            </div>
            <p className="hint-text">↵ Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </>
  );
}