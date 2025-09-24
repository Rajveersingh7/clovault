import {NextRequest, NextResponse} from "next/server";
import {auth} from "@/lib/auth";
import {getSupabaseAdmin} from "@/lib/supabaseServer";

type Session = {
  user: {
    id: string;
    email: string;
  };
  userId: string;
};

export async function GET(
  request: NextRequest,
  {params}: {params: Promise<{id: string}>}
) {
  const session = (await auth()) as Session | null;

  if (!session?.user) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  // Await the params promise
  const resolvedParams = await params;

  const supabase = getSupabaseAdmin();

  const {data: fileRow, error: selectError} = await supabase
    .from("files")
    .select("*")
    .eq("id", resolvedParams.id)
    .eq("user_identifier", session.userId)
    .single();

  if (selectError || !fileRow) {
    return NextResponse.json({error: "Not found"}, {status: 404});
  }

  const {data: signed, error: signedError} = await supabase.storage
    .from("user-files")
    .createSignedUrl(fileRow.storage_path, 60);

  if (signedError || !signed?.signedUrl) {
    return NextResponse.json({error: "Failed to generate URL"}, {status: 500});
  }

  return NextResponse.redirect(signed.signedUrl);
}
