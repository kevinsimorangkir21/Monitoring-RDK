import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
    let body: { token?: string };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { success: false, message: "Invalid request body" },
            { status: 400 }
        );
    }

    const { token } = body;

    if (!token || typeof token !== "string") {
        return NextResponse.json(
            { success: false, message: "Token is required" },
            { status: 400 }
        );
    }

    // Decode JWT payload (base64url) without verification — signature is
    // validated on every request by the Go backend's AuthMiddleware.
    let exp: number | undefined;
    try {
        const parts = token.split(".");
        if (parts.length !== 3) {
            throw new Error("Malformed JWT");
        }
        // Base64url → Base64 → JSON
        const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
        const payload = JSON.parse(payloadJson) as { exp?: number };
        exp = payload.exp;
    } catch {
        return NextResponse.json(
            { success: false, message: "Invalid token format" },
            { status: 400 }
        );
    }

    // Calculate Max-Age from exp claim; fall back to 1 hour if exp is absent.
    const nowSeconds = Math.floor(Date.now() / 1000);
    const maxAge =
        exp !== undefined && exp > nowSeconds ? exp - nowSeconds : 3600;

    const isProduction = process.env.NODE_ENV === "production";

    const response = NextResponse.json({ success: true });

    response.cookies.set("jwt", token, {
        httpOnly: true,
        sameSite: "lax",
        // secure: true only in production — localhost is HTTP and doesn't support Secure cookies
        secure: isProduction,
        path: "/",
        maxAge,
    });

    return response;
}
