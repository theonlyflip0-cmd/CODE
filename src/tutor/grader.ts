import Anthropic from "@anthropic-ai/sdk";
import type { Attempt, Concept, GradeResult } from "./types";

const MODEL = "claude-opus-4-8";

const GRADE_SCHEMA = {
  type: "object",
  properties: {
    passed: {
      type: "boolean",
      description:
        "true ONLY if the student's explanation is clear, in their own words, and free of the misconceptions listed in the rubric",
    },
    praise: {
      type: "string",
      description:
        "1-2 sentences naming specifically what the student got right. Encouraging but honest — never praise something they didn't actually say.",
    },
    gaps: {
      type: "array",
      items: { type: "string" },
      description:
        "Specific gaps or misconceptions, each one short sentence. Empty if passed.",
    },
    reteach: {
      type: "string",
      description:
        "Re-teach ONLY the missing piece(s), 2-4 sentences, plain language, with an aircraft/rocket example. Empty string if passed.",
    },
    follow_up: {
      type: "string",
      description:
        "One check question targeting the weakest gap. If passed, a short stretch question they can answer mentally before moving on.",
    },
  },
  required: ["passed", "praise", "gaps", "reteach", "follow_up"],
  additionalProperties: false,
} as const;

function systemPrompt(concept: Concept): string {
  return `You are a precise, encouraging calculus tutor for a beginner first-year aeronautical engineering student. The student has just been taught one concept and must explain it back in their own words. Your job:

1. Grade the explanation against the rubric below.
2. Name specific gaps or misconceptions — be concrete, not generic.
3. Re-teach ONLY the missing piece, briefly, using aircraft/rocket examples.
4. Ask one follow-up check question.
5. Do NOT pass the student until they explain the concept clearly. A vague or memorized-sounding answer does not pass. Partial credit is feedback, not a pass.

Correct subtle errors precisely (e.g. confusing "derivative of speed" with "derivative of position", or treating the derivative as a formula rather than a rate). Stay strictly practical — no epsilon-delta limits, no proofs, nothing that starts with "prove that".

CONCEPT BEING TESTED: ${concept.title}

RUBRIC — a passing explanation must convey, in the student's own words:
${concept.rubric}

MISCONCEPTIONS TO ACTIVELY CHECK FOR:
${concept.misconceptions}

Tone: warm, direct, specific. Talk to the student as "you". Keep every field concise.`;
}

async function gradeWithClaude(
  concept: Concept,
  history: Attempt[],
  answer: string,
  apiKey: string,
): Promise<GradeResult> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const messages: Anthropic.MessageParam[] = [];
  for (const a of history) {
    messages.push({ role: "user", content: a.student });
    messages.push({
      role: "assistant",
      content: JSON.stringify({
        passed: a.result.passed,
        praise: a.result.praise,
        gaps: a.result.gaps,
        reteach: a.result.reteach,
        follow_up: a.result.followUp,
      }),
    });
  }
  messages.push({
    role: "user",
    content:
      history.length === 0
        ? `Here is my explanation of the concept in my own words:\n\n${answer}`
        : `My answer to your follow-up question:\n\n${answer}`,
  });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: systemPrompt(concept),
    messages,
    output_config: {
      format: { type: "json_schema", schema: GRADE_SCHEMA },
    },
  });

  if (response.stop_reason === "refusal") {
    throw new Error("The AI teacher declined to grade this answer. Try rephrasing it.");
  }

  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") {
    throw new Error("The AI teacher returned an empty response. Please try again.");
  }
  const parsed = JSON.parse(text.text) as {
    passed: boolean;
    praise: string;
    gaps: string[];
    reteach: string;
    follow_up: string;
  };
  return {
    passed: parsed.passed,
    praise: parsed.praise,
    gaps: parsed.gaps,
    reteach: parsed.reteach,
    followUp: parsed.follow_up,
  };
}

/**
 * Offline fallback: keyword/rubric matching. Far weaker than the AI teacher,
 * but lets the loop function without an API key.
 */
function gradeOffline(concept: Concept, answer: string): GradeResult {
  const text = answer.toLowerCase();
  const missing = concept.keyIdeas.filter(
    (k) => !k.patterns.some((p) => p.test(text)),
  );
  const hit = concept.keyIdeas.length - missing.length;
  const longEnough = answer.trim().length >= 120;
  const passed = missing.length === 0 && longEnough;

  const gaps: string[] = missing.map((m) => `Your explanation doesn't cover: ${m.idea}.`);
  if (!longEnough) {
    gaps.push(
      "Your explanation is very short — spell the idea out fully, as if teaching a classmate.",
    );
  }

  return {
    passed,
    offline: true,
    praise:
      hit > 0
        ? `You touched on ${hit} of ${concept.keyIdeas.length} key ideas — good start.`
        : "Thanks for attempting it — let's build this up piece by piece.",
    gaps: passed ? [] : gaps,
    reteach: passed ? "" : missing.map((m) => m.hint).join(" "),
    followUp: passed
      ? "Nice — as a mental stretch: " + concept.offlineFollowUp
      : "Try again, this time covering the missing pieces: " + concept.offlineFollowUp,
  };
}

export async function grade(
  concept: Concept,
  history: Attempt[],
  answer: string,
  apiKey: string | null,
): Promise<GradeResult> {
  if (!apiKey) return gradeOffline(concept, answer);
  try {
    return await gradeWithClaude(concept, history, answer, apiKey);
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      throw new Error("Your Anthropic API key was rejected — check it in Settings.");
    }
    if (err instanceof Anthropic.RateLimitError) {
      throw new Error("Rate limited by the Claude API — wait a moment and resubmit.");
    }
    if (err instanceof Anthropic.APIConnectionError) {
      throw new Error("Couldn't reach the Claude API — check your connection and retry.");
    }
    if (err instanceof Anthropic.APIError) {
      throw new Error(`Claude API error (${err.status ?? "?"}): ${err.message}`);
    }
    throw err;
  }
}
