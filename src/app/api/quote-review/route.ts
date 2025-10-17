import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(req: Request) {
  const body = await req.json();
  const { title, purchase_price, retail_price, condition, notes } = body;

  // Call OpenAI API (replace with your prompt and model)
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `
  You are an assistant that evaluates used furniture acquisition deals.
  Follow these rules to calculate a recommended offer range and verdict:
  
  - Base range = 8-12% of retail price.
  - Adjust for condition:
    - Like New: up to 12-14%
    - Good: around 10%
    - Fair: around 6-8%
  - Adjust for brand quality (e.g., Room & Board, West Elm, RH, IKEA):
    - High-end brands: add 2-3% tolerance
    - Low-end brands: subtract 2-3% tolerance
  
  Calculate the adjusted range. 
  If the purchase price is less than or equal to the high end of the adjusted range, the verdict is "Probable Acceptance".
  If the purchase price is above the high end of the adjusted range, the verdict is "Unlikely Acceptance".
  
  Respond ONLY with the following JSON object (not as a string, and do not include any extra text):
  
  {
    "resale_range": "string (e.g. '$320-$480')",
    "is_below_high_end": true | false,
    "reasoning": "string (1-2 sentences, use normal English capitalization and punctuation DO NOT use all caps here)"
  }
  
  - All keys and boolean values must be lowercase.
  - The "reasoning" field should be written in normal English, not all caps.
  - Do not include any text outside the JSON object.
  
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