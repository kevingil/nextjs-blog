'use server'
import { ChatOpenAI } from "@langchain/openai";
import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver, Annotation, messagesStateReducer } from "@langchain/langgraph";
import { createArticle } from "@/components/blog/actions";
import { generateArticleImage } from "../images/generation";
import { DEFAULT_IMAGE_PROMPT } from "../images/const";

// Store an array of messages in state
const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
  }),
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.7,
  openAIApiKey: OPENAI_API_KEY,
});

// Original writer node
async function originalWriterCall(state: typeof StateAnnotation.State) {
  const messages = state.messages;
  const response = await model.invoke(messages);
  return { messages: [response] };
}

// Editor node
async function editorCall(state: typeof StateAnnotation.State) {
  const messages = state.messages;
  const response = await model.invoke(messages);
  return { messages: [response] };
}

// Workflow chain
const workflow = new StateGraph(StateAnnotation)
  .addNode("originalWriter", originalWriterCall)
  .addNode("editor", editorCall)
  .addEdge("__start__", "originalWriter")
  .addEdge("originalWriter", "editor")
  .addEdge("editor", "__end__");

const checkpointer = new MemorySaver();
const app = workflow.compile({ checkpointer });

export async function generateArticle(prompt: string, title: string, authorId: number) {
  // Construct two calls:
  // First for the "originalWriter" node (system instructs to write a draft),
  // then for the "editor" node (system instructs to refine it).

  // Messages for the original writer
  const originalWriterSystem = new SystemMessage(
    "You are the Original Writer. Draft a compelling blog article based on the given prompt."
  );
  const userPrompt = new HumanMessage(
    `Prompt: ${prompt}\n\nTitle: "${title}"\n\nPlease write a complete blog article with clear sections, engaging language, and relevant details.`
  );

  // Messages for the editor
  const editorSystem = new SystemMessage(
    "You are the Editor. Improve and refine the previously drafted content. Make it more concise, clear, and engaging. Preserve the main idea and style, but ensure it's polished for publication."
  );
  const editorRequest = new HumanMessage(
    "Refine the text above, correct errors, and produce the finalized version of the article."
  );

  // Run the workflow
  const finalState = await app.invoke(
    {
      messages: [
        originalWriterSystem,
        userPrompt,
        editorSystem,
        editorRequest,
      ],
    },
    // Thread ID to store conversation in memory
    { configurable: { thread_id: "article_generation_thread" } }
  );

  // Final message from the editor node
  const finalMessages = finalState.messages;
  const finalArticleContent = finalMessages[finalMessages.length - 1].content;

  // Create article from final content
  const newArticle = await createArticle({
    title,
    content: finalArticleContent.toString(),
    tags: [],
    isDraft: false,
    authorId: authorId,
  });

  try {
    await generateArticleImage(DEFAULT_IMAGE_PROMPT[Math.floor(Math.random() * DEFAULT_IMAGE_PROMPT.length)], newArticle.id);
  } catch (error) {
    console.error("Error generating article image", error);
  }

  return newArticle;
}
