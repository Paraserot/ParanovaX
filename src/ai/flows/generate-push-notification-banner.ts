
'use server';

/**
 * @fileOverview AI agent for generating push notification images.
 *
 * - generatePushNotificationBanner - A function that generates a push notification image using AI.
 * - GeneratePushNotificationBannerInput - The input type for the generatePushNotificationBanner function.
 * - GeneratePushNotificationBannerOutput - The return type for the generatePushNotificationBanner function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { uploadImage } from '@/services/storage';

const GeneratePushNotificationBannerInputSchema = z.object({
  imageText: z.string().describe('The text to be displayed on the image. This should be the main message or headline.'),
  accentColor: z
    .string()
    .describe(
      'A hex code representing the desired accent color for the image (e.g., #800080).'
    ),
});
export type GeneratePushNotificationBannerInput = z.infer<
  typeof GeneratePushNotificationBannerInputSchema
>;

const GeneratePushNotificationBannerOutputSchema = z.object({
  mediaUrl: z
    .string()
    .describe(
      'The public URL of the generated image after being stored in Firebase Storage.'
    ),
});
export type GeneratePushNotificationBannerOutput = z.infer<
  typeof GeneratePushNotificationBannerOutputSchema
>;

// Helper to convert data URI to a Buffer
function dataUriToBuffer(dataUri: string): { buffer: Buffer; mime: string, name: string } {
    if (!dataUri.startsWith('data:')) {
        throw new Error('Invalid data URI');
    }

    const metaPart = dataUri.split(';')[0];
    const mime = metaPart.split(':')[1];
    
    const dataPart = dataUri.split(',')[1];
    if (!mime || !dataPart) {
        throw new Error('Invalid data URI format');
    }
    
    const buffer = Buffer.from(dataPart, 'base64');
    const extension = mime.split('/')[1] || 'png';
    const name = `generated_banner_${Date.now()}.${extension}`;
    
    return { buffer, mime, name };
}

export async function generatePushNotificationBanner(
  input: GeneratePushNotificationBannerInput
): Promise<GeneratePushNotificationBannerOutput> {
  return generatePushNotificationBannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePushNotificationBannerPrompt',
  input: {schema: GeneratePushNotificationBannerInputSchema},
  output: {schema: z.object({ imagePrompt: z.string() })},
  prompt: `You are an expert creative director specializing in designing ad banners for push notifications.
  Your task is to generate a detailed, effective image generation prompt based on the user's request.
  The final image should be visually appealing, modern, and suitable for a mobile app push notification.
  It must incorporate the main text and use the specified accent color.

  Request Details:
  - Image Text: {{{imageText}}}
  - Accent Color: {{{accentColor}}}

  Instructions for the prompt:
  1.  Create a detailed scene description for a promotional image.
  2.  The image should be professional and eye-catching.
  3.  The accent color '{{{accentColor}}}' must be a key visual element.
  4.  The text '{{{imageText}}}' should be clearly visible and legible on the image.
  5.  The final output should be a single, detailed image generation prompt.

  Respond only with the generated prompt in the 'imagePrompt' field of the JSON output.
  `,
});

const generatePushNotificationBannerFlow = ai.defineFlow(
  {
    name: 'generatePushNotificationBannerFlow',
    inputSchema: GeneratePushNotificationBannerInputSchema,
    outputSchema: GeneratePushNotificationBannerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    const imagePrompt = output?.imagePrompt;
    
    if (!imagePrompt) {
        throw new Error("Could not generate an image prompt from the provided details.");
    }
    
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: imagePrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('No media was generated.');
    }

    // Convert data URI to a Blob-like object for upload
    const { buffer, mime, name } = dataUriToBuffer(media.url);
    
    // In Node.js environment, File constructor might not be available globally.
    // We can create a blob-like object for the upload function.
    const fileLike = {
      buffer,
      name,
      type: mime,
      size: buffer.length
    };

    // Upload to Firebase Storage
    const uploadResult = await uploadImage(fileLike as any, `notifications/generated/${name}`);

    if (uploadResult.error || !uploadResult.downloadURL) {
        throw new Error(uploadResult.error || "Failed to upload generated image.");
    }

    return {mediaUrl: uploadResult.downloadURL};
  }
);
