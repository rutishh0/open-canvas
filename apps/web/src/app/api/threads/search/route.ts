import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // Parse the request body
        const body = await req.json();

        // Log body for debugging (optional, remove in production)
        console.log("Received body:", body);

        // Your logic here
        return NextResponse.json({ threads: [] });
    } catch (error) {
        console.error("Error handling request:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
