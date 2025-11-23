import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { parseBody } from "@/legacy/api/parser";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  api: {
    bodyParser: false,
  },
}

interface ParseBodyData {
  category: string;
  additional_prompt: string;
  script: string;
}

const thumbnail_generation = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { category, additional_prompt, script } = await parseBody<ParseBodyData>(req);
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [
      {
        role: "system",
        content: `You are a designer, a thumbnail maker for YouTube.
        An expert in this domain, you role is from a YouTube video script to create a prompt to create the thumbnail of this video.

        Respect this rules :
        
        - The prompt must detailed as much as possible the most importants points of the video, you need to give as much details as you can about the thumbnail like a student in art school will have.
        
        - Prompt should always be in english and used for text to image models AI.
        
        - Be careful not to stuff the thumbnail with too much information either, as it needs to be comprehensive and realistic. Try to generate a thumbnail that gives users something to click on.
        
        - Output only the prompt, and not the thumbnail itself. The prompt should be a single paragraphe of keywords only.

        - I don't want any special characters

        - I don't want any text on the image, only graphics

        - Generate me the most modern miniature you can, with coherent colors.

        ${category ? `- The thumbnail must be based on the ${category} while maintaining the context of the video script` : ""}

        ${additional_prompt ? `- IMPORTANT ! Pay close attention to this rule: ${additional_prompt}` : ""}

        - Output is only the prompt,don't add any other information`,
      },
      {
        role: "user",
        content: `Script: ${script}`,
      },
    ],
  });


  var response = chatCompletion.choices[0].message.content as string;
  if (response) {
    const image_response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${response} ${additional_prompt}`,
      n: 1,
      response_format: "url",
      size: "1792x1024",
    });
  
    if (image_response) {
      var response_data = image_response.data;
      return res.status(200).json(response_data);
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default thumbnail_generation;
