import {
  createContextDocumentMessages,
  getFormattedReflections,
  getModelConfig,
  getModelFromConfig,
  isUsingO1MiniModel,
  optionallyGetSystemPromptFromConfig,
} from "@/agent/utils";
import { ArtifactV3 } from "@/types";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import {
  OpenCanvasGraphAnnotation,
  OpenCanvasGraphReturnType,
} from "../../state";
import { ARTIFACT_TOOL_SCHEMA } from "./schemas";
import { createArtifactContent, formatNewArtifactPrompt } from "./utils";

/**
 * Generate a new artifact based on the user's query.
 */
export const generateArtifact = async (
  state: typeof OpenCanvasGraphAnnotation.State,
  config: LangGraphRunnableConfig
): Promise<OpenCanvasGraphReturnType> => {
  const { modelName, modelProvider } = getModelConfig(config, {
    isToolCalling: true,
  });
  const smallModel = await getModelFromConfig(config, {
    temperature: 0.5,
    isToolCalling: true,
  });

  const modelWithArtifactTool = smallModel.bindTools(
    [
      {
        name: "generate_artifact",
        schema: ARTIFACT_TOOL_SCHEMA,
      },
    ],
    // Ollama does not support tool choice
    { ...(modelProvider !== "ollama" && { tool_choice: "generate_artifact" }) }
  );

  const memoriesAsString = await getFormattedReflections(config);
  const formattedNewArtifactPrompt = formatNewArtifactPrompt(
    memoriesAsString,
    modelName
  );

  const userSystemPrompt = optionallyGetSystemPromptFromConfig(config);
  const fullSystemPrompt = userSystemPrompt
    ? `${userSystemPrompt}\n${formattedNewArtifactPrompt}`
    : formattedNewArtifactPrompt;

  const contextDocumentMessages = await createContextDocumentMessages(config);
  const isO1MiniModel = isUsingO1MiniModel(config);
  const response = await modelWithArtifactTool.invoke(
    [
      { role: isO1MiniModel ? "user" : "system", content: fullSystemPrompt },
      ...contextDocumentMessages,
      ...state.messages,
    ],
    { runName: "generate_artifact" }
  );

  const newArtifactContent = createArtifactContent(response.tool_calls?.[0]);
  const newArtifact: ArtifactV3 = {
    currentIndex: 1,
    contents: [newArtifactContent],
  };

  return {
    artifact: newArtifact,
  };
};
