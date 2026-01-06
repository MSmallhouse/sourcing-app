import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(req: Request) {
  const body = await req.json();
  const { title, purchase_price, retail_price, condition, notes } = body;

  // Call OpenAI API (replace with your prompt and model)
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `
  You are an assistant that evaluates used furniture acquisition deals for resale.

  Your goal is to calculate a realistic resale value, evaluate projected profit, and return a clear acceptance verdict.

  Step 1 - Estimate resale value of the item:
    - Base resale estimate = 25% of retail price
    - Apply the following adjustments to the resale range based on item condition:
      - Like New: resale estimate += 13% of retail price
      - Good: resale estimate += 10% of retail price
      - Fair: resale estimate += 8% of retail price
    - Apply the following adjustments based on brand quality:
      - High-end brands (e.g. RH, Room & Board, West Elm): resale estimate += 3% of retail price
      - Mid-range brands: no adjustment
      - Low-end brands (e.g. IKEA, Wayfair, Amazon): resale estimate -= 3% of retail price
  
  Step 2 - Calculate profit:
    - Subtract the user-supplied purchase price from the above resale estimate
  
  Step 3 - Accept or reject:
    - If the profit is above or equal to $250 → likely acceptance
    - If the profit is below $250 → unlikely acceptance
  
  Output rules (IMPORTANT):
  - Respond ONLY with the following JSON object.
  - Do NOT include explanations outside the JSON.
  - Do NOT include markdown, code blocks, or extra text.
  - All keys and values must be lowercase except for dollar amounts.
  - Write the "reasoning" field in normal English capitalization (not all caps).
  - Keep reasoning to 1–2 concise sentences.
  
  Required JSON format:
  
  {
    "resale_estimate": "string (e.g. '$800')",
    "accepted": true | false,
    "reasoning": "string"
  }
  
  Submission:
  Item: ${title}
  Retail Price: ${retail_price}
  Condition: ${condition}
  Purchase Price: ${purchase_price}
  Notes: ${notes}
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    max_completion_tokens: 150,
  });

  if (!response.choices || !response.choices[0].message.content) {
    return NextResponse.json({error: 'ERROR'});
  }

  const verdict = response.choices[0].message.content.trim().toUpperCase();
  return NextResponse.json({ verdict });
}