import { NextRequest, NextResponse } from "next/server";
import { getMasterCzerCode, secretsMatch } from "@/lib/security";


const CZER_CODE = getMasterCzerCode();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;
    if (!secretsMatch(typeof code === "string" ? code : null, CZER_CODE)) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json({ ok: false, error: "Invalid code" }, { status: 403 });
    }

    return NextResponse.json({ ok: true, message: "Code verified. Use the sign-in form." });
  } catch (err) {
    console.error("Czer error:", err);
    return NextResponse.json({ ok: false, error: "Failed to verify" }, { status: 500 });
  }
}
