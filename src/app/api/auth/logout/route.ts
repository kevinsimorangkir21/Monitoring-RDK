import { NextResponse } from "next/server";

export async function POST(): Promise<NextResponse> {
    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.json({ success: true });

    // Clear the jwt cookie by setting Max-Age=0.
    // expires is also set to a past date for older browser compatibility.
    response.cookies.set("jwt", "", {
        httpOnly: true,
        sameSite: "lax",
        // Match the secure flag used when setting the cookie
        secure: isProduction,
        path: "/",
        maxAge: 0,
        expires: new Date(0),
    });

    return response;
}
