import { createServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createServer();

  const { origin, searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const errorCode = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (errorCode) {
    const params = new URLSearchParams({
      error: errorCode,
      description: errorDescription || ""
    });
    return NextResponse.redirect(`${origin}/login?${params}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const params = new URLSearchParams({
      error: error.code ?? "unknown",
      description: error.message
    });
    return NextResponse.redirect(`${origin}/login?${params}`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
