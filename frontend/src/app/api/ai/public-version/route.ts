import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/provider";

export async function POST(request: Request) {
  const body = await request.json();
  const provider = getAIProvider();
  const response = await provider.createPublicVersion(body);

  return NextResponse.json(response);
}
