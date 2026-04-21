import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/provider";

export async function POST(request: Request) {
  const body = await request.json();
  const provider = getAIProvider();
  const result = await provider.generateIcebreakers(body);
  return NextResponse.json(result);
}
