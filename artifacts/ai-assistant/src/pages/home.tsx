import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  PenTool,
  Code2,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  ChevronRight,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import ParticleCanvas from "@/components/ParticleCanvas";
import { useStreamingGenerate } from "@/hooks/useStreamingGenerate";

interface HistoryItem {
  id: string;
  prompt: string;
  response: string;
  mode: "writing" | "coding";
  timestamp: Date;
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Home() {
  const [mode, setMode] = useState<"writing" | "coding">("writing");
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const submittedPromptRef = useRef("");
  const submittedModeRef = useRef<"writing" | "coding">("writing");
  const prevStatusRef = useRef<string>("");

  const { text, status, mode: responseMode, generate, reset } = useStreamingGenerate();

  const isStreaming = status === "streaming";
  const isDone = status === "done";
  const isError = status === "error";
  const hasOutput = isStreaming || isDone || isError;

  useEffect(() => {
    if (prevStatusRef.current !== "done" && status === "done" && text && submittedPromptRef.current) {
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        prompt: submittedPromptRef.current,
        response: text,
        mode: (responseMode as "writing" | "coding") || submittedModeRef.current,
        timestamp: new Date(),
      };
      setHistory((prev) => [newItem, ...prev].slice(0, 20));
    }
    prevStatusRef.current = status;
  }, [status, text, responseMode]);

  const handleGenerate = () => {
    if (!prompt.trim() || isStreaming) return;
    submittedPromptRef.current = prompt.trim();
    submittedModeRef.current = mode;
    reset();
    generate(prompt, mode);
  };

  const handleCopy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  const handleRestoreHistory = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setMode(item.mode);
    reset();
    setExpandedId(null);
  };

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col items-center py-14 px-4 sm:px-6 lg:px-8"
      style={{ fontFamily: "'Inter', sans-serif", position: "relative", zIndex: 1 }}
    >
      <div
        className="w-full flex gap-6 justify-center"
        style={{ alignItems: "flex-start", maxWidth: historyOpen ? "1160px" : "768px", transition: "max-width 0.35s ease" }}
      >
        {/* ── History Sidebar ── */}
        <div
          data-testid="history-panel"
          style={{
            width: historyOpen ? "280px" : "0px",
            minWidth: historyOpen ? "280px" : "0px",
            overflow: "hidden",
            transition: "width 0.35s ease, min-width 0.35s ease, opacity 0.3s ease",
            opacity: historyOpen ? 1 : 0,
            pointerEvents: historyOpen ? "auto" : "none",
          }}
        >
          <div
            className="glass-panel"
            style={{
              borderRadius: "1.25rem",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              maxHeight: "80vh",
              position: "sticky",
              top: "4rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  color: "hsl(185 90% 50% / 0.7)",
                  textTransform: "uppercase",
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                History
              </span>
              <button
                onClick={() => setHistoryOpen(false)}
                aria-label="Close history"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "hsl(260 20% 55%)",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "6px",
                  transition: "color 0.2s",
                }}
              >
                <X style={{ width: "14px", height: "14px" }} />
              </button>
            </div>

            {history.length === 0 ? (
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "hsl(260 20% 45%)",
                  textAlign: "center",
                  padding: "2rem 0",
                  lineHeight: 1.6,
                }}
              >
                Your generations will appear here.
              </p>
            ) : (
              <div
                style={{
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  paddingRight: "2px",
                }}
              >
                {history.map((item) => {
                  const isExpanded = expandedId === item.id;
                  return (
                    <div
                      key={item.id}
                      data-testid="history-item"
                      style={{
                        borderRadius: "0.75rem",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        overflow: "hidden",
                        transition: "border-color 0.2s, background 0.2s",
                      }}
                    >
                      {/* Item header — always visible */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "4px",
                        }}
                      >
                        {/* Main restore area — single click restores the prompt */}
                        <button
                          data-testid="history-restore-btn"
                          onClick={() => handleRestoreHistory(item)}
                          title="Click to restore this prompt"
                          style={{
                            flex: 1,
                            minWidth: 0,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "10px 0 10px 12px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            textAlign: "left",
                            gap: "5px",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "0.8rem",
                              color: "hsl(195 80% 88%)",
                              lineHeight: 1.45,
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              wordBreak: "break-word",
                              margin: 0,
                            }}
                          >
                            {item.prompt}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span
                              style={{
                                fontSize: "0.62rem",
                                fontWeight: 600,
                                letterSpacing: "0.08em",
                                color: item.mode === "coding" ? "hsl(275 70% 65%)" : "hsl(185 90% 55%)",
                                textTransform: "uppercase",
                                background: item.mode === "coding"
                                  ? "hsl(275 70% 65% / 0.12)"
                                  : "hsl(185 90% 55% / 0.12)",
                                borderRadius: "4px",
                                padding: "1px 5px",
                              }}
                            >
                              {item.mode}
                            </span>
                            <span style={{ fontSize: "0.67rem", color: "hsl(260 20% 45%)" }}>
                              {formatRelativeTime(item.timestamp)}
                            </span>
                          </div>
                        </button>

                        {/* Chevron — separately toggles response preview */}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          aria-label={isExpanded ? "Collapse preview" : "Expand preview"}
                          style={{
                            flexShrink: 0,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "10px 10px 10px 4px",
                            color: "hsl(185 90% 55% / 0.5)",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <ChevronRight
                            style={{
                              width: "12px",
                              height: "12px",
                              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                            }}
                          />
                        </button>
                      </div>

                      {/* Expanded response preview */}
                      {isExpanded && (
                        <div
                          style={{
                            borderTop: "1px solid rgba(255,255,255,0.06)",
                            padding: "10px 12px",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "hsl(260 20% 55%)",
                              lineHeight: 1.5,
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 4,
                              WebkitBoxOrient: "vertical",
                              wordBreak: "break-word",
                              margin: 0,
                            }}
                          >
                            {item.response}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="w-full max-w-3xl space-y-8" style={{ flex: "1 1 auto", minWidth: 0 }}>

          {/* ── Header ── */}
          <div style={{ position: "relative" }}>
            <div className="text-center space-y-3">
              <h1
                data-testid="header-title"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(2rem, 5vw, 3rem)",
                  letterSpacing: "0.12em",
                  background: "linear-gradient(135deg, hsl(185 90% 65%) 0%, hsl(195 80% 75%) 40%, hsl(275 70% 70%) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "none",
                }}
              >
                Oryon
              </h1>
              {/* Neon accent underline */}
              <div
                style={{
                  width: "80px",
                  height: "2px",
                  margin: "0 auto",
                  background: "linear-gradient(90deg, transparent, hsl(185 90% 55%), hsl(275 70% 65%), transparent)",
                  boxShadow: "0 0 12px hsl(185 90% 55% / 0.8), 0 0 24px hsl(185 90% 55% / 0.4)",
                  borderRadius: "9999px",
                }}
              />
              <p
                data-testid="header-description"
                style={{
                  color: "hsl(260 20% 62%)",
                  fontSize: "1rem",
                  letterSpacing: "0.04em",
                }}
              >
                A focused workspace for refining thoughts and code.
              </p>
            </div>

            {/* History toggle button */}
            <button
              data-testid="history-toggle-btn"
              onClick={() => setHistoryOpen((o) => !o)}
              aria-label="Toggle history"
              title={historyOpen ? "Close history" : "View history"}
              style={{
                position: "absolute",
                top: "50%",
                right: 0,
                transform: "translateY(-50%)",
                background: historyOpen
                  ? "hsl(185 90% 55% / 0.15)"
                  : "rgba(255,255,255,0.05)",
                border: historyOpen
                  ? "1px solid hsl(185 90% 55% / 0.35)"
                  : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "9999px",
                padding: "7px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                color: historyOpen ? "hsl(185 90% 65%)" : "hsl(260 20% 60%)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                transition: "all 0.2s ease",
              }}
            >
              <Clock style={{ width: "13px", height: "13px" }} />
              {history.length > 0 && (
                <span
                  style={{
                    background: "hsl(185 90% 55%)",
                    color: "hsl(270 30% 6%)",
                    borderRadius: "9999px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "0 5px",
                    minWidth: "16px",
                    textAlign: "center",
                    lineHeight: "16px",
                    height: "16px",
                  }}
                >
                  {history.length}
                </span>
              )}
            </button>
          </div>

          {/* ── Mode Toggle ── */}
          <div className="flex justify-center">
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(v) => v && setMode(v as "writing" | "coding")}
              data-testid="toggle-mode"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "9999px",
                padding: "4px",
                display: "flex",
                gap: "4px",
              }}
            >
              <ToggleGroupItem
                value="writing"
                aria-label="Toggle writing mode"
                data-testid="mode-writing"
                style={{
                  borderRadius: "9999px",
                  padding: "6px 20px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  letterSpacing: "0.03em",
                  border: "1px solid transparent",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <PenTool style={{ width: "15px", height: "15px" }} />
                Writing
              </ToggleGroupItem>
              <ToggleGroupItem
                value="coding"
                aria-label="Toggle coding mode"
                data-testid="mode-coding"
                style={{
                  borderRadius: "9999px",
                  padding: "6px 20px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  letterSpacing: "0.03em",
                  border: "1px solid transparent",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Code2 style={{ width: "15px", height: "15px" }} />
                Coding
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* ── Input Panel ── */}
          <div
            className="glass-panel"
            style={{ borderRadius: "1.25rem", overflow: "hidden" }}
          >
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === "writing"
                  ? "What are you trying to say?"
                  : "Describe the logic or paste code to refactor..."
              }
              data-testid="input-prompt"
              style={{
                minHeight: "160px",
                resize: "vertical",
                border: "none",
                outline: "none",
                boxShadow: "none",
                background: "transparent",
                fontSize: "0.975rem",
                lineHeight: "1.7",
                padding: "1.25rem 1.5rem",
                color: "hsl(195 80% 92%)",
                fontFamily: "'Inter', sans-serif",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "10px 12px",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(0,0,0,0.15)",
              }}
            >
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isStreaming}
                data-testid="button-generate"
                className="shimmer-btn"
                style={{
                  borderRadius: "9999px",
                  padding: "8px 24px",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  letterSpacing: "0.06em",
                  color: "hsl(270 30% 6%)",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: isStreaming || !prompt.trim() ? "not-allowed" : "pointer",
                  transition: "box-shadow 0.25s ease, transform 0.2s ease",
                }}
              >
                {isStreaming ? (
                  <>
                    <div
                      className="animate-spin"
                      style={{
                        width: "15px",
                        height: "15px",
                        borderRadius: "9999px",
                        border: "2px solid hsl(270 30% 6% / 0.4)",
                        borderTopColor: "hsl(270 30% 6%)",
                      }}
                    />
                    Processing
                  </>
                ) : (
                  <>
                    <Sparkles style={{ width: "15px", height: "15px" }} />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* ── Output Panel ── */}
          {hasOutput && (
            <div
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-3"
            >
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  color: "hsl(185 90% 50% / 0.7)",
                  textTransform: "uppercase",
                  paddingLeft: "2px",
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                Response
              </p>

              <div
                className="glass-panel-strong"
                style={{
                  borderRadius: "1.25rem",
                  overflow: "hidden",
                  minHeight: "200px",
                  position: "relative",
                }}
              >
                {/* Loading state — only shown before any text arrives */}
                {isStreaming && !text && (
                  <div
                    data-testid="status-loading"
                    style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "14px" }}
                  >
                    {[0.75, 1, 0.83, 1, 0.6].map((w, i) => (
                      <Skeleton
                        key={i}
                        className="skeleton-neon"
                        style={{
                          height: "14px",
                          width: `${w * 100}%`,
                          borderRadius: "6px",
                          background: undefined,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Error state */}
                {isError && (
                  <div
                    data-testid="status-error"
                    style={{
                      padding: "2rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      minHeight: "200px",
                      color: "hsl(0 70% 65%)",
                      fontSize: "0.9rem",
                    }}
                  >
                    <AlertTriangle style={{ width: "18px", height: "18px", flexShrink: 0 }} />
                    Something went wrong. Please try again.
                  </div>
                )}

                {/* Streaming / done content */}
                {(isStreaming || isDone) && text && (
                  <div
                    className="group"
                    data-testid="response-content"
                    style={{ position: "relative" }}
                  >
                    {/* Copy button — only visible after generation completes */}
                    {isDone && (
                      <div
                        style={{
                          position: "absolute",
                          top: "16px",
                          right: "16px",
                          zIndex: 10,
                          opacity: 0,
                          transition: "opacity 0.2s ease",
                        }}
                        className="group-hover:opacity-100"
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCopy}
                          data-testid="button-copy"
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            backdropFilter: "blur(12px)",
                            WebkitBackdropFilter: "blur(12px)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: "9999px",
                            padding: "5px 14px",
                            fontSize: "0.8rem",
                            color: copied ? "hsl(145 70% 55%)" : "hsl(195 80% 85%)",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                          }}
                        >
                          {copied
                            ? <><Check style={{ width: "13px", height: "13px" }} /> Copied</>
                            : <><Copy style={{ width: "13px", height: "13px" }} /> Copy</>
                          }
                        </Button>
                      </div>
                    )}

                    <div
                      className="prose prose-slate max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent"
                      style={{ padding: "1.75rem" }}
                    >
                      {responseMode === "coding" ? (
                        isDone ? (
                          <SyntaxHighlighter
                            language="javascript"
                            style={vscDarkPlus}
                            customStyle={{
                              margin: 0,
                              padding: "1.5rem",
                              borderRadius: "0.75rem",
                              background: "rgba(0,0,0,0.35)",
                              fontSize: "0.875rem",
                            }}
                          >
                            {text}
                          </SyntaxHighlighter>
                        ) : (
                          <pre
                            style={{
                              margin: 0,
                              padding: "1.5rem",
                              borderRadius: "0.75rem",
                              background: "rgba(0,0,0,0.35)",
                              fontSize: "0.875rem",
                              color: "hsl(195 80% 88%)",
                              fontFamily: "monospace",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}
                          >
                            {text}
                            <span className="typing-cursor" />
                          </pre>
                        )
                      ) : isDone ? (
                        <ReactMarkdown>{text}</ReactMarkdown>
                      ) : (
                        <div
                          style={{
                            color: "hsl(195 80% 88%)",
                            fontSize: "0.975rem",
                            lineHeight: "1.7",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {text}
                          <span className="typing-cursor" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Particle canvas overlay */}
      <ParticleCanvas />

      {/* Ambient orbs for depth */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: -1,
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "9999px",
          background: "radial-gradient(circle, hsl(275 80% 35% / 0.25) 0%, transparent 70%)",
          filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute",
          bottom: "-10%",
          right: "-10%",
          width: "600px",
          height: "600px",
          borderRadius: "9999px",
          background: "radial-gradient(circle, hsl(185 90% 30% / 0.2) 0%, transparent 70%)",
          filter: "blur(50px)",
        }} />
      </div>
    </div>
  );
}
