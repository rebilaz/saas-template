// app/api/extract-job-id/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { s3 } from "@/legacy/aws/config";

// Comme tu utilises le SDK AWS (Node), on force le runtime node
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // 🔐 Récupération de l'utilisateur via Supabase côté serveur
  const supabase = createSupabaseServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not connected" }, { status: 401 });
  }

  // 🔎 Récupération du jobId dans l'URL /api/extract-job-id?jobId=xxx
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId || typeof jobId !== "string") {
    return NextResponse.json(
      { error: "Job Id is missing or invalid" },
      { status: 400 }
    );
  }

  try {
    // 🎯 Lecture de l'objet S3
    const data = await s3
      .getObject({
        Bucket: "ytscale-jobs", // ton bucket
        Key: jobId,
      })
      .promise();

    if (data && data.Body) {
      const fileContent = data.Body.toString("utf-8");
      const payloadData = JSON.parse(fileContent);

      const transcript =
        payloadData?.results?.channels?.[0]?.alternatives?.[0]?.transcript ??
        null;

      return NextResponse.json(
        { status: "finished", result: transcript },
        { status: 200 }
      );
    }

    // Si pas de body, on considère que c'est encore en cours
    return NextResponse.json({ status: "in_progress" }, { status: 200 });
  } catch (error) {
    // Si l'objet n'existe pas encore ou autre erreur → on renvoie "in_progress"
    return NextResponse.json({ status: "in_progress" }, { status: 200 });
  }
}
