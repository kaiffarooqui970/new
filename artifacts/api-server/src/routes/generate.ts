import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GenerateBody } from "@workspace/api-zod";

const router = Router();

const SYSTEM_PROMPTS = {
  writing:
    "You are a helpful writing assistant that improves style, clarity, and engagement. Respond with well-structured, polished text. Use markdown formatting where appropriate to enhance readability.",
  coding:
    "You are a coding assistant that explains, writes, and improves code with comments. Always include clear explanations, well-commented code examples, and best practices. Use markdown code blocks with the appropriate language specified.",
} as const;

router.post("/generate", async (req, res) => {
  const parsed = GenerateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request: prompt and mode are required" });
    return;
  }

  const { prompt, mode } = parsed.data;

  const systemPrompt = SYSTEM_PROMPTS[mode];

  const completion = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  });

  const result = completion.choices[0]?.message?.content ?? "";

  res.json({ result, mode });
});

router.post("/generate/stream", async (req, res) => {
  const parsed = GenerateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request: prompt and mode are required" });
    return;
  }

  const { prompt, mode } = parsed.data;
  const systemPrompt = SYSTEM_PROMPTS[mode];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const stream = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 8192,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content ?? "";
    if (text) {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
  }

  res.write(`data: ${JSON.stringify({ done: true, mode })}\n\n`);
  res.end();
});

export default router;
