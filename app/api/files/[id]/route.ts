import {NextRequest, NextResponse} from "next/server";
import {auth} from "@/lib/auth";
import {getSupabaseAdmin} from "@/lib/supabaseServer";
import {revalidatePath} from "next/cache";

type Session = {
  user: {
    id: string;
    email: string;
  };
  userId: string;
};

export async function DELETE(
  _req: NextRequest,
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

  const {error: removeError} = await supabase.storage
    .from("user-files")
    .remove([fileRow.storage_path]);

  if (removeError) {
    return NextResponse.json({error: removeError.message}, {status: 500});
  }

  const {error: deleteError} = await supabase
    .from("files")
    .delete()
    .eq("id", resolvedParams.id);

  if (deleteError) {
    return NextResponse.json({error: deleteError.message}, {status: 500});
  }

  revalidatePath("/dashboard");

  return NextResponse.json({ok: true});
}
