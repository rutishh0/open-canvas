// File: apps/web/src/app/api/assistants/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyUserServerAction } from "@/lib/supabase/verify_user_server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await verifyUserServerAction();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch assistants from your database or service
    // Example:
    // const assistants = await db.assistants.findMany({ where: { userId } });

    // For testing, you could return dummy data:
    const assistants = [
      {
        assistant_id: "default-assistant",
        name: "Default Assistant",
        metadata: { 
          is_default: true, 
          iconData: { 
            iconName: "User", 
            iconColor: "#4b5563" 
          } 
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