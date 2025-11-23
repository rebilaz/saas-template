// app/api/prepare-upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { s3 } from "@/legacy/aws/config";
import { createSupabaseServer } from "@/lib/supabase/server";

// AWS SDK → Node obligatoire
export const runtime = "nodejs";

interface BodyData {
  name: string;
  type: string;
}

export async function POST(req: NextRequest) {
  // 1) Auth Supabase
  const supabase = createSupabaseServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not connected" }, { status: 401 });
  }

  // 2) Vérif crédits dans user_metadata
  const metadata = (user.user_metadata ?? {}) as {
    genLeft?: number;
  };

  const remainingCredits =
    typeof metadata.genLeft === "number" ? metadata.genLeft : null;

  if (remainingCredits !== null && remainingCredits <= 0) {
    return NextResponse.json({ error: "no_credits" }, { status: 403 });
  }

  // 3) Taille max du fichier (30 Mo)
  const limitLength = 31_457_280; // 30MB

  try {
    // 4) Récup du body (remplace parseBody)
    const { name, type }: BodyData = await req.json();

    if (!name || !type) {
      return NextResponse.json(
        { error: "Missing name or type" },
        { status: 400 }
      );
    }

    if (!process.env.AWS_S3_BUCKET_NAME) {
      return NextResponse.json(
        { error: "AWS_S3_BUCKET_NAME not configured" },
        { status: 500 }
      );
    }

    // 5) Création du presigned POST S3
    const fileParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Fields: {
        key: name,
        "Content-Type": type,
      },
      Expires: 600, // 10 minutes
      Conditions: [
        ["content-length-range", 0, limitLength], // limit taille
      ],
    };

    const data = await new Promise<any>((resolve, reject) => {
      s3.createPresignedPost(fileParams, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error handling file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
