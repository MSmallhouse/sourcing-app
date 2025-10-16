import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(req: Request) {
  const body = await req.json();
  const { title, purchase_price, projected_sale_price, notes } = body;

  // Call OpenAI API (replace with your prompt and model)
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `Review this furniture lead for pickup and reply only 'ACCEPT' or 'REJECT' based on whether it seems like it is profitable to pick up and flip:\nTitle: ${title}\nPurchase Price: ${purchase_price}\nProjected Sale Price: ${projected_sale_price}\n Notes: ${notes}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 50,
  });

  if (!response.choices || !response.choices[0].message.content) {
    return NextResponse.json({error: 'ERROR'});
  }

  const verdict = response.choices[0].message.content.trim().toUpperCase();
  if (verdict !== 'ACCEPT' && verdict !== 'REJECT') {
    return NextResponse.json({erorr: 'INVALID_VERDICT'});
  }
  return NextResponse.json({ verdict });
}