// apps/web/src/app/api/assistants/search/route.ts
import { NextResponse } from "next/server";
import { verifyUserServer } from "@/lib/supabase/verify_user_server";

export async function GET() {
  try {
    const { user } = await verifyUserServer();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch assistants from your database or service
    // For now, return a simple default assistant for testing
    const assistants = [
      {
        assistant_id: "default-assistant",
        name: "Default Assistant",
        metadata: { 
          is_default: true, 
          iconData: { 
            iconName: "User", 
            iconColor: "#4b5563" 
          },
          description: "Default assistant"
        },
        config: {
          configurable: {
            systemPrompt: "You are a helpful assistant."
          }
        }
      }
    ];

    return NextResponse.json({ assistants });
  } catch (error: any) {
    console.error("Error in assistants search:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}