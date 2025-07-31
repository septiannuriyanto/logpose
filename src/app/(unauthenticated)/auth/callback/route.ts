import { createServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createServer();
  const url = new URL(request.url);
  await supabase.auth.exchangeCodeForSession(url.searchParams.get("code")!);
  return NextResponse.redirect(url.origin + '/dashboard');
}
