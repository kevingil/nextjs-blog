'use server'

import { db } from "@/db/drizzle";
import { articles, imageGeneration } from "@/db/schema";
import { fal } from "@fal-ai/client";
import { eq } from "drizzle-orm";
import { uploadFile } from "@/lib/storage";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function generateArticleImage(prompt: string, articleId: number | undefined): Promise<{ 
  success: boolean, 
  generationRequestId: string,
}> {

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
        imageGenerationRequestId: falSubscription.requestId,
      })
      .where(eq(articles.id, articleId));

    console.log("Image generation request ID:", falSubscription.requestId);

    return { success: true, generationRequestId: falSubscription.requestId };

  } catch (error) {
    console.error(error);
    return { success: false, generationRequestId: ""};
  }

}

export async function getImageGeneration(requestId: string) {
  const imgGen = await db.select().from(imageGeneration).where(eq(imageGeneration.requestId, requestId)).limit(1);
  return imgGen[0];
}

export interface ImageGenerationStatus {
  accepted: boolean;
  requestId: string;
  outputUrl: string;
}

export async function getImageGenerationStatus(requestId: string): Promise<ImageGenerationStatus> {

  const result = await fal.queue.result("fal-ai/flux/dev", {
    requestId: requestId,
  });

  if (result) {
    console.log("imgen result", result.data.images[0].url);
    const imageUrl = result.data.images[0].url;
    const contentType = result.data.images[0].content_type || undefined;
    const imgFile = await fetch(imageUrl).then(res => res.blob()).then(blob => new File([blob], "image.jpg", { type: contentType }));
    const uploadResult = await uploadFile(`${requestId}.jpg`, imgFile);
    console.log("imgen uploadResult", uploadResult);
    if (uploadResult.$metadata.httpStatusCode === 200) {
      const outputUrl = `${process.env.NEXT_PUBLIC_S3_URL_PREFIX}/${requestId}.jpg`;
      await db
        .update(imageGeneration)
        .set({
          outputUrl: outputUrl,
        })
        .where(eq(imageGeneration.requestId, requestId));

      await db
        .update(articles)
        .set({
          imageGenerationRequestId: null,
        })
        .where(eq(articles.imageGenerationRequestId, requestId));

      return { accepted: true, requestId: requestId, outputUrl: outputUrl };
    }
  }

  return { accepted: true, requestId: requestId, outputUrl: "" };
}

