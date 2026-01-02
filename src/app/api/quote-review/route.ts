import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(req: Request) {
  const body = await req.json();
  const { title, purchase_price, retail_price, condition, notes } = body;

  // Call OpenAI API (replace with your prompt and model)
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `
  You are an assistant that evaluates used furniture acquisition deals for resale.

  Your goal is to calculate a realistic resale value range, evaluate projected profit, and return a clear acceptance verdict.
  
  Follow these rules strictly:
  
  1) Retail-based valuation
  - Base resale range = 20–30% of retail price.
  - Base acquisition offer range = 8–12% of retail price.
  
  2) Condition adjustments (applied to acquisition offer range)
  - Like New: 12–14% of retail
  - Good: ~10% of retail
  - Fair: 6–8% of retail
  - Poor: below 6% of retail (generally not recommended)
  
  3) Brand quality adjustment (applied after condition)
  - High-end brands (e.g. RH, Room & Board, West Elm): add +2–3%
  - Mid-range brands: no adjustment
  - Low-end brands (e.g. IKEA, Wayfair, Amazon): subtract −2–3%
  
  4) Profit logic
  - Assume resale price will fall within the resale range (20–30% of retail).
  - Target minimum profit = $300.
  - Deals with projected profit:
    - ≥ $300 → strong candidates
    - $200–$299 → borderline
    - < $200 → generally reject
  
  5) Verdict logic
  - Calculate the adjusted acquisition offer range.
  - If the purchase price is less than or equal to the HIGH END of the adjusted range → verdict = "Likely Acceptance".
  - If the purchase price exceeds the high end → verdict = "Unlikely Acceptance".
  
  Output rules (IMPORTANT):
  - Respond ONLY with the following JSON object.
  - Do NOT include explanations outside the JSON.
  - Do NOT include markdown, code blocks, or extra text.
  - All keys and values must be lowercase except for dollar amounts.
  - Write the "reasoning" field in normal English capitalization (not all caps).
  - Keep reasoning to 1–2 concise sentences.
  
  Required JSON format:
  
  {
    "resale_range": "string (e.g. '$800–$1,200')",
    "acceptance_likelihood": "likely acceptance | unlikely acceptance",
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