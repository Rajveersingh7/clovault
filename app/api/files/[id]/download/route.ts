import {NextRequest, NextResponse} from "next/server";
import {auth} from "@/lib/auth";
import {getSupabaseAdmin} from "@/lib/supabaseServer";

type Props = {
  params: {id: string};
  searchParams: {[key: string]: string | string[] | undefined};
};

export async function GET(request: NextRequest, {params}: Props) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  const userId = (session as any).userId as string | undefined;
  if (!userId) {
    return NextResponse.json({error: "Missing user id"}, {status: 400});
  }

  const supabase = getSupabaseAdmin();

  const {data: fileRow, error: selectError} = await supabase
    .from("files")
    .select("*")
    .eq("id", params.id)
    .eq("user_identifier", userId)
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
