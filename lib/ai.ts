import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeTradesWithAI(trades: any[]) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const prompt = `
Analyze these trading journal entries.

Give response in simple points:

1. Biggest mistakes
2. Best performing setup
3. Risk management score out of 10
4. Win/loss patterns
5. Emotional mistakes
6. Improvement suggestions

Trades:
${JSON.stringify(trades)}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}