import { useToast } from "@/hooks/use-toast";
import { Assistant } from "@langchain/langgraph-sdk";
import { ContextDocument } from "@opencanvas/shared/types";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { createClient } from "@/hooks/utils";
import { getCookie, removeCookie } from "@/lib/cookies";
import { ASSISTANT_ID_COOKIE } from "@/constants";

type AssistantContentType = {
  assistants: Assistant[];
  selectedAssistant: Assistant | undefined;
  isLoadingAllAssistants: boolean;
  isDeletingAssistant: boolean;
  isCreatingAssistant: boolean;
  isEditingAssistant: boolean;
  getOrCreateAssistant: (userId: string) => Promise<void>;
  getAssistants: (userId: string) => Promise<void>;
  deleteAssistant: (assistantId: string) => Promise<boolean>;
  createCustomAssistant: (
    args: CreateCustomAssistantArgs
  ) => Promise<Assistant | undefined>;
  editCustomAssistant: (
    args: EditCustomAssistantArgs
  ) => Promise<Assistant | undefined>;
  setSelectedAssistant: Dispatch<SetStateAction<Assistant | undefined>>;
};

export type AssistantTool = {
  name: string;
  description: string;
  parameters: Record<string, any>;
};

export interface CreateAssistantFields {
  iconData?: {
    iconName: string;
    iconColor: string;
  };
  name: string;
  description?: string;
  tools?: Array<AssistantTool>;
  systemPrompt?: string;
  is_default?: boolean;
  documents?: ContextDocument[];
}

export type CreateCustomAssistantArgs = {
  newAssistant: CreateAssistantFields;
  userId: string;
  successCallback?: (id: string) => void;
};

export type EditCustomAssistantArgs = {
  editedAssistant: CreateAssistantFields;
  assistantId: string;
  userId: string;
};

const AssistantContext = createContext<AssistantContentType | undefined>(
  undefined
);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isLoadingAllAssistants, setIsLoadingAllAssistants] = useState(false);
  const [isDeletingAssistant, setIsDeletingAssistant] = useState(false);
  const [isCreatingAssistant, setIsCreatingAssistant] = useState(false);
  const [isEditingAssistant, setIsEditingAssistant] = useState(false);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant>();

  const getAssistants = async (userId: string): Promise<void> => {
    if (!userId) {
      console.error("Error: Missing userId when fetching assistants.");
      return;
    }

    setIsLoadingAllAssistants(true);
    try {
      const client = createClient();
      console.log("Fetching assistants for user:", userId);

      const response = await client.assistants.search({
        metadata: { user_id: userId },
      });

      console.log("Assistants found:", response);
      setAssistants([...response]);
    } catch (e) {
      console.error("Failed to get assistants", e);
      toast({ title: "Failed to get assistants", description: "Try again later." });
    } finally {
      setIsLoadingAllAssistants(false);
    }
  };

  const deleteAssistant = async (assistantId: string): Promise<boolean> => {
    setIsDeletingAssistant(true);
    try {
      const client = createClient();
      await client.assistants.delete(assistantId);

      if (selectedAssistant?.assistant_id === assistantId) {
        const defaultAssistant = assistants.find((a) => a.metadata?.is_default) || assistants[0];
        setSelectedAssistant(defaultAssistant);
      }

      setAssistants((prev) =>
        prev.filter((assistant) => assistant.assistant_id !== assistantId)
      );
      return true;
    } catch (e) {
      console.error("Failed to delete assistant", e);
      return false;
    } finally {
      setIsDeletingAssistant(false);
    }
  };

  const getOrCreateAssistant = async (userId: string) => {
    if (!userId) {
      console.error("Error: User ID is missing in getOrCreateAssistant.");
      return;
    }

    console.log("Looking for an assistant for user:", userId);
    setIsLoadingAllAssistants(true);

    try {
      const client = createClient();
      let userAssistants: Assistant[] = [];

      try {
        userAssistants = await client.assistants.search({
          graphId: "agent",
          metadata: { user_id: userId },
          limit: 100,
        });
      } catch (e) {
        console.error("Error fetching assistants:", e);
      }

      if (!userAssistants.length) {
        console.log("No assistants found, creating a new one...");
        await createCustomAssistant({
          newAssistant: {
            name: "Default Assistant",
            description: "Your default assistant",
            is_default: true,
            iconData: { iconName: "User", iconColor: "#000000" },
          },
          userId,
        });
        return;
      }

      setAssistants(userAssistants);
      setSelectedAssistant(userAssistants[0]); 
    } catch (error) {
      console.error("Error in getOrCreateAssistant:", error);
    } finally {
      setIsLoadingAllAssistants(false);
    }
  };

  const createCustomAssistant = async ({
    newAssistant,
    userId,
    successCallback,
  }: CreateCustomAssistantArgs): Promise<Assistant | undefined> => {
    setIsCreatingAssistant(true);
    try {
      const client = createClient();
      const { tools, systemPrompt, name, documents, ...metadata } = newAssistant;

      const createdAssistant = await client.assistants.create({
        graphId: "agent",
        name,
        metadata: {
          user_id: userId,
          ...metadata,
        },
        config: {
          configurable: {
            tools,
            systemPrompt,
            documents,
          },
        },
        ifExists: "do_nothing",
      });

      setAssistants((prev) => [...prev, createdAssistant]);
      setSelectedAssistant(createdAssistant);
      successCallback?.(createdAssistant.assistant_id);
      return createdAssistant;
    } catch (e) {
      console.error("Failed to create an assistant", e);
      return undefined;
    } finally {
      setIsCreatingAssistant(false);
    }
  };

  const editCustomAssistant = async ({
    editedAssistant,
    assistantId,
    userId,
  }: EditCustomAssistantArgs): Promise<Assistant | undefined> => {
    setIsEditingAssistant(true);
    try {
      const client = createClient();
      const { tools, systemPrompt, name, documents, ...metadata } = editedAssistant;
      const response = await client.assistants.update(assistantId, {
        name,
        graphId: "agent",
        metadata: {
          user_id: userId,
          ...metadata,
        },
        config: {
          configurable: {
            tools,
            systemPrompt,
            documents,
          },
        },
      });

      setAssistants((prev) =>
        prev.map((assistant) =>
          assistant.assistant_id === assistantId ? response : assistant
        )
      );
      return response;
    } catch (e) {
      console.error("Failed to edit assistant", e);
      return undefined;
    } finally {
      setIsEditingAssistant(false);
    }
  };

  /**
   * Legacy function which gets the assistant and updates its metadata. Then, it deletes the assistant ID cookie
   * to ensure this function does not run again.
   */
  const legacyGetAndUpdateAssistant = async (
    userId: string,
    assistantIdCookie: string
  ) => {
    const updatedAssistant = await editCustomAssistant({
      editedAssistant: {
        is_default: true,
        iconData: {
          iconName: "User",
          iconColor: "#000000",
        },
        description: "Your default assistant.",
        name: "Default assistant",
        tools: undefined,
        systemPrompt: undefined,
      },
      assistantId: assistantIdCookie,
      userId,
    });

    if (!updatedAssistant) {
      const ghIssueTitle = "Failed to set default assistant";
      const ghIssueBody = `Failed to set the default assistant for user.\n\nDate: '${new Date().toISOString()}'`;
      const assignee = "bracesproul";
      const queryParams = new URLSearchParams({
        title: ghIssueTitle,
        body: ghIssueBody,
        assignee,
        "labels[]": "autogenerated",
      });
      const newIssueURL = `https://github.com/langchain-ai/open-canvas/issues/new?${queryParams.toString()}`;

      toast({
        title: "Failed to edit assistant",
        description: (
          <p>
            Please open an issue{" "}
            <a href={newIssueURL} target="_blank">
              here
            </a>{" "}
            (do <i>not</i> edit fields) and try again later.
          </p>
        ),
      });
      return;
    }

    setSelectedAssistant(updatedAssistant);
    setAssistants([updatedAssistant]);
    removeCookie(ASSISTANT_ID_COOKIE);
  };

  // Wrap the top-level legacy call inside an async IIFE so that await is allowed.
  (async () => {
    const assistantIdCookie = getCookie(ASSISTANT_ID_COOKIE);
    const userId = "someUserId"; // Replace with your actual user id logic.
    if (assistantIdCookie) {
      await legacyGetAndUpdateAssistant(userId, assistantIdCookie);
    } else {
      await getOrCreateAssistant(userId);
    }
  })();

  const contextValue: AssistantContentType = {
    assistants,
    selectedAssistant,
    isLoadingAllAssistants,
    isDeletingAssistant,
    isCreatingAssistant,
    isEditingAssistant,
    getOrCreateAssistant,
    getAssistants,
    deleteAssistant,
    createCustomAssistant,
    editCustomAssistant,
    setSelectedAssistant,
  };

  return (
    <AssistantContext.Provider value={contextValue}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistantContext() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error("useAssistantContext must be used within an AssistantProvider");
  }
  return context;
}
