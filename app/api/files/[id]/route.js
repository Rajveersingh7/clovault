import {NextResponse} from "next/server";
import {auth} from "@/lib/auth";
import {getSupabaseAdmin} from "@/lib/supabaseServer";
import {revalidatePath} from "next/cache";

export async function DELETE(_req, context) {
  const {params} = context;

  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  const supabase = getSupabaseAdmin();

  const {data: fileRow, error: selectError} = await supabase
    .from("files")
    .select("*")
    .eq("id", params.id)
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
    .eq("id", params.id);

  if (deleteError) {
    return NextResponse.json({error: deleteError.message}, {status: 500});
  }

  revalidatePath("/dashboard");

  return NextResponse.json({ok: true});
}
