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
  script: string;
  language: string;
}

const analyseVideoHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // const session = await getSession({ req });

  // if (!session) {
  //   return res.status(401).json({ error: "Not connected" });
  // }

  const { script, language } = await parseBody<ParseBodyData>(req);

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [
      {
        role: "system",
        content: `You are a Youtuber, your role is according the first 5 minutes of a video script that will be upload on YouTube.

        Respect this rules :
        
        - Keep the title short and to the point. Make sure the title accurately reflects the content of the video and is concise, making it easy to read and remember.
        
        - Use power words. Using power words in your title can help to convey emotions and make your title more attention-grabbing.
        
        - Ask a question. Titles that ask questions can be effective in piquing a viewer’s curiosity and encouraging them to click.
        
        - You will also find a well optimized SEO description
        
        - Find the best tags for this video, each tag will start with a #
        
        - Output is JSON format only as :
        - Language output is ${language}

        {
        "best_titles":
             [
             ],
        "description":"",
        "tags":[
        ]
        }`,
      },
      {
        role: "user",
        content: `Script: ${script}`,
      },
    ],
  });

  var response = chatCompletion.choices[0].message.content as string;
  if (response) {
    var json = JSON.parse(response);
    return res.status(200).json(json);
  } else {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default analyseVideoHandler;
