import { useState, useCallback } from "react";
import { useGenerate } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PenTool, Code2, Sparkles, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Home() {
  const [mode, setMode] = useState<"writing" | "coding">("writing");
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useGenerate();

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    generate.mutate({ data: { prompt, mode } });
  };

  const handleCopy = useCallback(() => {
    if (!generate.data?.result) return;
    navigator.clipboard.writeText(generate.data.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generate.data?.result]);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 
            className="text-4xl font-serif font-semibold tracking-tight text-foreground"
            data-testid="header-title"
          >
            Clarity
          </h1>
          <p 
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
            data-testid="header-description"
          >
            A focused workspace for refining thoughts and code.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <ToggleGroup 
            type="single" 
            value={mode} 
            onValueChange={(v) => v && setMode(v as "writing" | "coding")}
            className="bg-muted p-1 rounded-lg"
            data-testid="toggle-mode"
          >
            <ToggleGroupItem 
              value="writing" 
              aria-label="Toggle writing mode"
              className="gap-2 px-4 data-[state=on]:bg-background data-[state=on]:shadow-sm"
              data-testid="mode-writing"
            >
              <PenTool className="w-4 h-4" />
              Writing
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="coding" 
              aria-label="Toggle coding mode"
              className="gap-2 px-4 data-[state=on]:bg-background data-[state=on]:shadow-sm"
              data-testid="mode-coding"
            >
              <Code2 className="w-4 h-4" />
              Coding
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Input Area */}
        <Card className="p-1 overflow-hidden shadow-sm border-muted-foreground/20">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={mode === "writing" ? "What are you trying to say?" : "Describe the logic or paste code to refactor..."}
            className="min-h-[160px] resize-y border-0 focus-visible:ring-0 shadow-none text-base p-4"
            data-testid="input-prompt"
          />
          <div className="flex justify-end p-2 bg-muted/30 border-t border-muted-foreground/10">
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || generate.isPending}
              className="gap-2"
              data-testid="button-generate"
            >
              {generate.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-r-transparent animate-spin" />
                  Processing
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Output Area */}
        {(generate.data || generate.isPending || generate.isError) && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Response
            </h2>
            <Card className="relative overflow-hidden shadow-sm border-muted-foreground/20 min-h-[200px]">
              {generate.isPending ? (
                <div className="p-6 space-y-4" data-testid="status-loading">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : generate.isError ? (
                <div className="p-6 text-destructive flex items-center justify-center h-full min-h-[200px]" data-testid="status-error">
                  Something went wrong. Please try again.
                </div>
              ) : generate.data ? (
                <div className="relative group" data-testid="response-content">
                  <div className="absolute right-4 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopy}
                      className="gap-2 bg-background/80 backdrop-blur shadow-sm hover:bg-background"
                      data-testid="button-copy"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  
                  <div className="p-6 prose prose-slate max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
                    {mode === "coding" ? (
                      <SyntaxHighlighter
                        language="javascript"
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          padding: '1.5rem',
                          borderRadius: '0',
                          background: 'hsl(var(--card))',
                          fontSize: '0.875rem'
                        }}
                      >
                        {generate.data.result}
                      </SyntaxHighlighter>
                    ) : (
                      <ReactMarkdown>
                        {generate.data.result}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ) : null}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
