'use server'

import { db } from "@/db/drizzle";
import { articles, imageGeneration } from "@/db/schema";
import { fal } from "@fal-ai/client";
import { eq } from "drizzle-orm";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function generateArticleImage(prompt: string, articleId: number | undefined): Promise<{ success: boolean, generationRequestId: string }> {

  if (!articleId) {
    return { success: false, generationRequestId: "" };
  }

  try {

  const falSubscription = await fal.subscribe("fal-ai/flux/dev", {
    input: {
      prompt: prompt,
      image_size: "landscape_16_9",
      num_images: 1,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        update.logs.map((log) => log.message).forEach(console.log);
      }
    },
  });

  
  console.log(falSubscription.data);
  console.log(falSubscription.requestId);

  const [newImage] = await db
    .insert(imageGeneration)
    .values({
      prompt,
      provider: "fal",
      model: "flux/dev",
      requestId: falSubscription.requestId,
    })
    .returning();

  await db
    .update(articles)
    .set({
      imageGenerationId: newImage.id,
    })
    .where(eq(articles.id, articleId));

    console.log("Image generation request ID:", falSubscription.requestId);

    return { success: true, generationRequestId: falSubscription.requestId };

  } catch (error) {
    console.error(error);
    return { success: false, generationRequestId: "" };
  }

}
