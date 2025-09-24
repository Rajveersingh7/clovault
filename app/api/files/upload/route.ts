import {NextResponse} from "next/server";
import {auth} from "@/lib/auth";
import {getSupabaseAdmin} from "@/lib/supabaseServer";
import {revalidatePath} from "next/cache";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  const userId = (session as any).userId as string | undefined;
  if (!userId) {
    return NextResponse.json({error: "Missing user id"}, {status: 400});
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return NextResponse.json({error: "No file provided"}, {status: 400});
  }

  const supabase = getSupabaseAdmin();
  const fileId = crypto.randomUUID();
  const storagePath = `${userId}/${fileId}-${file.name}`;

  const {error: uploadError} = await supabase.storage
    .from("user-files")
    .upload(storagePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });

  if (uploadError) {
    return NextResponse.json({error: uploadError.message}, {status: 500});
  }

  const {data: inserted, error: insertError} = await supabase
    .from("files")
    .insert({
      user_identifier: userId,
      original_name: file.name,
      storage_path: storagePath,
      mime_type: file.type || null,
      size_bytes: typeof file.size === "number" ? file.size : null
    })
    .select("*")
    .single();

  if (insertError) {
    await supabase.storage.from("user-files").remove([storagePath]);
    return NextResponse.json({error: insertError.message}, {status: 500});
  }

  revalidatePath("/dashboard");

  return NextResponse.json(inserted, {status: 201});
}
