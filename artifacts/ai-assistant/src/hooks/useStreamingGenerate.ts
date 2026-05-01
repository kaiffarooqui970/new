import { useState, useCallback, useRef } from "react";

export type StreamStatus = "idle" | "streaming" | "done" | "error";

export interface StreamingGenerateState {
  text: string;
  mode: "writing" | "coding" | null;
  status: StreamStatus;
}

export function useStreamingGenerate() {
  const [state, setState] = useState<StreamingGenerateState>({
    text: "",
    mode: null,
    status: "idle",
  });

  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (prompt: string, mode: "writing" | "coding") => {
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      setState({ text: "", mode, status: "streaming" });

      try {
        const response = await fetch("/api/generate/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, mode }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error("Stream request failed");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";
        let receivedDone = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            try {
              const parsed = JSON.parse(raw);
              if (parsed.done) {
                receivedDone = true;
                setState((prev) => ({ ...prev, status: "done", mode: parsed.mode ?? mode }));
              } else if (typeof parsed.text === "string") {
                accumulated += parsed.text;
                const snapshot = accumulated;
                setState((prev) => ({
                  ...prev,
                  text: snapshot,
                }));
              }
            } catch {
            }
          }
        }

        if (!receivedDone) {
          setState((prev) => ({ ...prev, status: "done" }));
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setState((prev) => ({ ...prev, status: "error" }));
      }
    },
    []
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ text: "", mode: null, status: "idle" });
  }, []);

  return { ...state, generate, reset };
}
