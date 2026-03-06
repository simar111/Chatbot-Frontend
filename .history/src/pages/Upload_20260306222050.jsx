import { useState, useRef } from "react";
import axios from "axios";
import ChatWidget from "../components/charwidjet";
const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const PDFIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2a10 10 0 0 1 10 10" style={{ animation: "spin 0.8s linear infinite", transformOrigin: "center" }} />
  </svg>
);

export default function Upload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(""); // "success" | "error" | "loading"
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (f && f.type === "application/pdf") {
      setFile(f);
      setMessage("");
      setStatus("");
      setProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("loading");
    setProgress(0);
    setMessage("");

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await axios.post("http://localhost:5000/upload", formData, {
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total);
          setProgress(pct);
        },
      });
      setMessage(res.data.message);
      setStatus("success");
    } catch {
      setMessage("Upload failed. Please try again.");
      setStatus("error");
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setMessage("");
    setStatus("");
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; font-family: 'Sora', sans-serif; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.3); } 50% { box-shadow: 0 0 0 8px rgba(139,92,246,0); } }
        @keyframes orb1 { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(30px,-20px) scale(1.05); } 66% { transform: translate(-20px,15px) scale(0.95); } }
        @keyframes orb2 { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(-25px,20px) scale(0.95); } 66% { transform: translate(20px,-15px) scale(1.05); } }
        @keyframes progressFill { from { width: 0%; } }
        @keyframes successPop { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes dashDraw { to { stroke-dashoffset: 0; } }

        .page {
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
          position: absolute; border-radius: 50%;
          filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .orb1 { width:500px;height:500px; background:radial-gradient(circle,rgba(139,92,246,.15) 0%,transparent 70%); top:-100px;left:-100px; animation:orb1 12s ease-in-out infinite; }
        .orb2 { width:400px;height:400px; background:radial-gradient(circle,rgba(59,130,246,.12) 0%,transparent 70%); bottom:-80px;right:-80px; animation:orb2 14s ease-in-out infinite; }
        .orb3 { width:300px;height:300px; background:radial-gradient(circle,rgba(236,72,153,.08) 0%,transparent 70%); bottom:30%;right:20%; animation:orb1 18s ease-in-out infinite reverse; }

        .card {
          width: 100%; max-width: 460px;
          background: rgba(15,15,25,0.85);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          backdrop-filter: blur(32px);
          box-shadow: 0 0 0 1px rgba(139,92,246,.05), 0 32px 80px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.05);
          overflow: hidden;
          position: relative;
          z-index: 1;
          animation: fadeSlideUp 0.4s ease forwards;
        }

        /* Header */
        .card-header {
          padding: 24px 28px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(139,92,246,0.04);
        }

        .header-icon {
          width: 44px; height: 44px;
          border-radius: 14px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          display: flex; align-items: center; justify-content: center;
          color: white;
          box-shadow: 0 4px 20px rgba(124,58,237,.4);
          animation: pulseGlow 3s ease-in-out infinite;
          flex-shrink: 0;
        }

        .header-text h2 {
          font-size: 16px; font-weight: 600;
          color: #f1f0ff; letter-spacing: -0.01em;
        }
        .header-text p {
          font-size: 12px; color: rgba(255,255,255,.35);
          margin-top: 2px;
        }

        .header-badge {
          margin-left: auto;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; padding: 4px 10px;
          border-radius: 20px;
          background: rgba(139,92,246,.15);
          border: 1px solid rgba(139,92,246,.25);
          color: #a78bfa; letter-spacing: .05em;
        }

        /* Body */
        .card-body { padding: 28px; display: flex; flex-direction: column; gap: 20px; }

        /* Drop Zone */
        .dropzone {
          border: 1.5px dashed rgba(139,92,246,.3);
          border-radius: 16px;
          padding: 36px 24px;
          text-align: center;
          cursor: pointer;
          transition: border-color .2s, background .2s, transform .15s;
          position: relative;
          background: rgba(139,92,246,.03);
        }

        .dropzone:hover, .dropzone.dragging {
          border-color: rgba(139,92,246,.65);
          background: rgba(139,92,246,.07);
          transform: scale(1.01);
        }

        .dropzone.has-file {
          border-style: solid;
          border-color: rgba(139,92,246,.4);
          background: rgba(139,92,246,.05);
          padding: 20px 24px;
        }

        .drop-icon-wrap {
          width: 56px; height: 56px;
          border-radius: 18px;
          background: rgba(139,92,246,.12);
          border: 1px solid rgba(139,92,246,.2);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
          color: #a78bfa;
          transition: background .2s;
        }

        .dropzone:hover .drop-icon-wrap, .dropzone.dragging .drop-icon-wrap {
          background: rgba(139,92,246,.22);
        }

        .drop-title {
          font-size: 14px; font-weight: 500;
          color: #e2e0ff; margin-bottom: 6px;
        }

        .drop-sub {
          font-size: 12px; color: rgba(255,255,255,.28);
          line-height: 1.5;
        }

        .drop-sub span {
          color: #a78bfa; font-weight: 500;
        }

        .file-pill {
          display: flex; align-items: center; gap: 12px;
          animation: fadeSlideUp 0.25s ease forwards;
        }

        .file-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(124,58,237,.3), rgba(79,70,229,.3));
          border: 1px solid rgba(139,92,246,.3);
          display: flex; align-items: center; justify-content: center;
          color: #a78bfa; flex-shrink: 0;
        }

        .file-info { flex: 1; text-align: left; min-width: 0; }
        .file-name {
          font-size: 13px; font-weight: 500;
          color: #e2e0ff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .file-size {
          font-size: 11px; color: rgba(255,255,255,.3);
          font-family: 'JetBrains Mono', monospace;
          margin-top: 2px;
        }

        .clear-btn {
          width: 28px; height: 28px;
          border-radius: 8px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.08);
          color: rgba(255,255,255,.4);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background .15s, color .15s;
          flex-shrink: 0;
        }
        .clear-btn:hover { background: rgba(239,68,68,.15); color: #f87171; border-color: rgba(239,68,68,.3); }

        /* Progress bar */
        .progress-wrap {
          animation: fadeSlideUp 0.2s ease forwards;
        }

        .progress-label {
          display: flex; justify-content: space-between;
          font-size: 11px; color: rgba(255,255,255,.3);
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 8px;
        }

        .progress-track {
          height: 4px; border-radius: 4px;
          background: rgba(255,255,255,.07);
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #7c3aed, #818cf8);
          border-radius: 4px;
          transition: width 0.3s ease;
          box-shadow: 0 0 10px rgba(124,58,237,.5);
        }

        /* Upload Button */
        .upload-btn {
          width: 100%; height: 48px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: white;
          font-family: 'Sora', sans-serif;
          font-size: 14px; font-weight: 600;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform .15s, box-shadow .15s, opacity .15s;
          box-shadow: 0 4px 20px rgba(124,58,237,.4);
          letter-spacing: 0.01em;
        }

        .upload-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(124,58,237,.5);
        }

        .upload-btn:active:not(:disabled) { transform: translateY(0); }
        .upload-btn:disabled { opacity: .35; cursor: not-allowed; transform: none; }

        .upload-btn .spinner { animation: spin 0.8s linear infinite; }

        /* Status message */
        .status-msg {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px; font-weight: 500;
          animation: fadeSlideUp 0.25s ease forwards;
        }

        .status-msg.success {
          background: rgba(34,197,94,.08);
          border: 1px solid rgba(34,197,94,.2);
          color: #86efac;
        }

        .status-msg.error {
          background: rgba(239,68,68,.08);
          border: 1px solid rgba(239,68,68,.2);
          color: #fca5a5;
        }

        .status-icon {
          width: 24px; height: 24px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .status-icon.success { background: rgba(34,197,94,.2); animation: successPop .4s ease forwards; }
        .status-icon.error { background: rgba(239,68,68,.2); }

        /* Footer */
        .card-footer {
          padding: 14px 28px;
          border-top: 1px solid rgba(255,255,255,.05);
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,.15);
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: .03em;
        }
      `}</style>

      <div className="page">
        <div className="bg-orb orb1" />
        <div className="bg-orb orb2" />
        <div className="bg-orb orb3" />

        <div className="card">
          {/* Header */}
          <div className="card-header">
            <div className="header-icon">
              <PDFIcon />
            </div>
            <div className="header-text">
              <h2>PDF Upload</h2>
              <p>Drag & drop or browse to select</p>
            </div>
            <div className="header-badge">PDF ONLY</div>
          </div>

          {/* Body */}
          <div className="card-body">
            {/* Dropzone */}
            <div
              className={`dropzone${isDragging ? " dragging" : ""}${file ? " has-file" : ""}`}
              onClick={() => !file && inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])}
              />

              {file ? (
                <div className="file-pill">
                  <div className="file-icon"><PDFIcon /></div>
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{formatSize(file.size)}</div>
                  </div>
                  <button className="clear-btn" onClick={clearFile}><XIcon /></button>
                </div>
              ) : (
                <>
                  <div className="drop-icon-wrap"><UploadIcon /></div>
                  <div className="drop-title">Drop your PDF here</div>
                  <div className="drop-sub">
                    or <span>browse files</span> from your device<br />
                    Max size: 50 MB · PDF format only
                  </div>
                </>
              )}
            </div>

            {/* Progress */}
            {status === "loading" && progress > 0 && (
              <div className="progress-wrap">
                <div className="progress-label">
                  <span>Uploading…</span>
                  <span>{progress}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              className="upload-btn"
              onClick={handleUpload}
              disabled={!file || status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <span className="spinner"><SpinnerIcon /></span>
                  Uploading…
                </>
              ) : (
                <>
                  <UploadIcon />
                  Upload PDF
                </>
              )}
            </button>

            {/* Status Message */}
            {message && (
              <div className={`status-msg ${status}`}>
                <div className={`status-icon ${status}`}>
                  {status === "success" ? <CheckIcon /> : <XIcon />}
                </div>
                {message}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="card-footer">
            Files processed securely · End-to-end encrypted
          </div>
          <ChatWidget />
        </div>
      </div>
    </>
  );
}