import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PenTool, Code2, Sparkles, Copy, Check, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import ParticleCanvas from "@/components/ParticleCanvas";
import { useStreamingGenerate } from "@/hooks/useStreamingGenerate";

export default function Home() {
  const [mode, setMode] = useState<"writing" | "coding">("writing");
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  const { text, status, mode: responseMode, generate, reset } = useStreamingGenerate();

  const isStreaming = status === "streaming";
  const isDone = status === "done";
  const isError = status === "error";
  const hasOutput = isStreaming || isDone || isError;

  const handleGenerate = () => {
    if (!prompt.trim() || isStreaming) return;
    reset();
    generate(prompt, mode);
  };

  const handleCopy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col items-center py-14 px-4 sm:px-6 lg:px-8"
      style={{ fontFamily: "'Inter', sans-serif", position: "relative", zIndex: 1 }}
    >
      <div className="w-full max-w-3xl space-y-8">

        {/* ── Header ── */}
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
