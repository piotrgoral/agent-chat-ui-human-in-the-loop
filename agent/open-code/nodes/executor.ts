import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { AIMessage } from "@langchain/langgraph-sdk";
import { OpenCodeState, OpenCodeUpdate } from "../types";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import ComponentMap from "../../uis";
import { typedUi } from "@langchain/langgraph-sdk/react-ui/server";

export async function executor(
  state: OpenCodeState,
  config: LangGraphRunnableConfig,
): Promise<OpenCodeUpdate> {
  const ui = typedUi<typeof ComponentMap>(config);

  const lastPlanToolCall = state.messages.findLast(
    (m) =>
      m.getType() === "ai" &&
      (m as unknown as AIMessage).tool_calls?.some((tc) => tc.name === "plan"),
  ) as AIMessage | undefined;
  const planToolCallArgs = lastPlanToolCall?.tool_calls?.[0]?.args as Record<
    string,
    any
  >;
  const nextPlanItem = planToolCallArgs?.remainingPlans?.[0] as
    | string
    | undefined;
  const numOfExecutedPlanItems = planToolCallArgs?.executedPlans?.length ?? 0;

  if (!nextPlanItem) {
    // All plans have been executed
    const successfullyFinishedMsg: AIMessage = {
      type: "ai",
      id: uuidv4(),
      content:
        "Successfully completed all the steps in the plan. Please let me know if you need anything else!",
    };
    return { messages: [successfullyFinishedMsg] };
  }

  let updateFileContents = "";
  switch (numOfExecutedPlanItems) {
    case 0:
      updateFileContents = await fs.readFile(
        "agent/open-code/nodes/plan-code/step-1.txt",
        "utf-8",
      );
      break;
    case 1:
      updateFileContents = await fs.readFile(
        "agent/open-code/nodes/plan-code/step-2.txt",
        "utf-8",
      );
      break;
    case 2:
      updateFileContents = await fs.readFile(
        "agent/open-code/nodes/plan-code/step-3.txt",
        "utf-8",
      );
      break;
    case 3:
      updateFileContents = await fs.readFile(
        "agent/open-code/nodes/plan-code/step-4.txt",
        "utf-8",
      );
      break;
    case 4:
      updateFileContents = await fs.readFile(
        "agent/open-code/nodes/plan-code/step-5.txt",
        "utf-8",
      );
      break;
    case 5:
      updateFileContents = await fs.readFile(
        "agent/open-code/nodes/plan-code/step-6.txt",
        "utf-8",
      );
      break;
    default:
      updateFileContents = "";
  }

  if (!updateFileContents) {
    throw new Error("No file updates found!");
  }

  const toolCallId = uuidv4();
  const aiMessage: AIMessage = {
    type: "ai",
    id: uuidv4(),
    content: "",
    tool_calls: [
      {
        name: "update_file",
        args: {
          new_file_content: updateFileContents as any,
          executed_plan_item: nextPlanItem as any,
        },
        id: toolCallId,
        type: "tool_call",
      },
    ],
  };

  const msg = ui.create("proposed-change", {
    toolCallId,
    change: updateFileContents,
    planItem: nextPlanItem,
  });
  msg.additional_kwargs["message_id"] = aiMessage.id;

  return {
    messages: [aiMessage],
    ui: [msg],
    timestamp: Date.now(),
  };
}
