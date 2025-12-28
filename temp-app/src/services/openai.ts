import OpenAI from 'openai';

const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Add VITE_OPENAI_API_KEY to your .env file.');
  }
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
};

export interface ParsedTrack {
  title: string;
  isrc?: string;
  iswc?: string;
  streams?: number;
  revenue?: number;
  platform?: string;
  period?: string;
  genre?: string;
}

export interface ParsedStatement {
  distributor: string;
  period: string;
  totalRevenue: number;
  tracks: ParsedTrack[];
  rawSummary: string;
}

const SYSTEM_PROMPT = `You are a music royalty statement parser. Extract structured data from royalty statements.

Supported distributors: DistroKid, TuneCore, CD Baby, Spotify for Artists, Apple Music, Amazon Music, ASCAP, BMI, SESAC, SoundExchange, YouTube Music, Tidal, Deezer, Pandora.

For each statement, extract:
1. Distributor name
2. Statement period (e.g., "January 2024" or "Q4 2023")
3. Total revenue
4. Individual tracks with: title, ISRC (if available), streams, revenue, platform

Return ONLY valid JSON in this exact format:
{
  "distributor": "string",
  "period": "string", 
  "totalRevenue": number,
  "tracks": [
    {
      "title": "string",
      "isrc": "string or null",
      "streams": number,
      "revenue": number,
      "platform": "string"
    }
  ],
  "rawSummary": "Brief 1-2 sentence summary"
}

If you cannot parse the content, return:
{"error": "Description of why parsing failed"}`;

export async function parseRoyaltyStatement(content: string, fileType: 'pdf' | 'csv' | 'text'): Promise<ParsedStatement> {
  const openai = getOpenAIClient();
  
  const userPrompt = `Parse this ${fileType.toUpperCase()} royalty statement and extract all track and revenue data:\n\n${content}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.1,
    max_tokens: 4000,
    response_format: { type: 'json_object' }
  });

  const result = response.choices[0]?.message?.content;
  if (!result) {
    throw new Error('No response from OpenAI');
  }

  const parsed = JSON.parse(result);
  if (parsed.error) {
    throw new Error(parsed.error);
  }

  return parsed as ParsedStatement;
}

export async function parseCSVContent(csvText: string): Promise<ParsedStatement> {
  return parseRoyaltyStatement(csvText, 'csv');
}

export async function parsePDFContent(pdfText: string): Promise<ParsedStatement> {
  return parseRoyaltyStatement(pdfText, 'pdf');
}

export function isAPIKeyConfigured(): boolean {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
}

