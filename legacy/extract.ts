// app/api/extract/route.ts
import { NextRequest, NextResponse } from "next/server";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

import { UpdateAWS } from "@/legacy/aws/config";
import { createSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface BodyData {
  videoUrl: string;
  fileName: string;
  lang: string;
}

export async function POST(req: NextRequest) {
  // 1) Config AWS
  UpdateAWS();

  // 2) Auth Supabase (plus de createSupabaseApiClient)
  const supabase = createSupabaseServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not connected" }, { status: 401 });
  }

  // On lit les crédits dans le user_metadata (comme avant)
  const metadata = (user.user_metadata ?? {}) as {
    genLeft?: number;
  };

  const remainingCredits =
    typeof metadata.genLeft === "number" ? metadata.genLeft : null;

  if (remainingCredits !== null && remainingCredits <= 0) {
    return NextResponse.json({ error: "no_credits" }, { status: 403 });
  }

  // 3) Récup du body (remplace parseBody)
  const { videoUrl, fileName, lang } = (await req.json()) as BodyData;

  if (!videoUrl || !fileName || !lang) {
    return NextResponse.json(
      { error: "Missing videoUrl, fileName or lang" },
      { status: 400 }
    );
  }

  // 4) Appel Lambda AWS
  const lambda = new AWS.Lambda();
  const jobId = uuidv4();

  const params = {
    FunctionName: "youtube-transcript", // ton Lambda
    InvocationType: "Event",
    Payload: JSON.stringify({
      jobId,
      deepgramApiKey: process.env.DEEPGRAM_API_KEY,
      videoUrl,
      fileName,
      lang,
    }),
  };

  try {
    await lambda.invoke(params).promise();
    return NextResponse.json({ jobId }, { status: 200 });
  } catch (e) {
    console.error("Lambda invocation error:", e);
    return NextResponse.json(
      { error: "Failed to start job" },
      { status: 500 }
    );
  }
}
