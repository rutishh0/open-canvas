// apps/web/src/app/api/assistants/search/route.ts
import { NextResponse } from "next/server";
import { verifyUserAuthenticated } from "@/lib/supabase/verify_user_server";

// Keep the GET handler
export async function GET() {
  return handleRequest();
}

// Add a POST handler
export async function POST() {
  return handleRequest();
}

// Shared logic for both GET and POST
async function handleRequest() {
  try {
    const auth = await verifyUserAuthenticated();

    if (!auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For testing, return a simple default assistant
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