import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const VENUE_PASSWORD = process.env.VENUE_LOGIN_PASSWORD;
const COOKIE_NAME = "venue_session";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!VENUE_PASSWORD) {
      console.error("VENUE_LOGIN_PASSWORD is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    if (password !== VENUE_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ success: true });
}
