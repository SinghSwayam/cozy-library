import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
  try {
    const { title, authors } = await req.json();

    if (!title || !authors) {
      return NextResponse.json(
        { error: "title and authors are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert literary critic and book enthusiast. Write in a warm, editorial tone. Do not use markdown, headers, or bullet points — only flowing prose.",
        },
        {
          role: "user",
          content: `Write a concise, engaging 2-paragraph summary and analysis of the book "${title}" by ${authors}.

Paragraph 1: Provide a compelling overview of the book's premise, themes, and narrative style without major spoilers. Keep it to 3–4 sentences.
Paragraph 2: Offer a thoughtful literary analysis — what makes this book special, its cultural impact, and who would love it. Keep it to 3–4 sentences.

Separate the two paragraphs with a blank line. Output only the two paragraphs, nothing else.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 512,
    });

    const text = completion.choices[0]?.message?.content ?? "";

    return NextResponse.json({ summary: text });
  } catch (err) {
    console.error("[/api/summary] Groq error:", err);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
