import {NextResponse} from "next/server";
import {auth} from "@/lib/auth";
import {getSupabaseAdmin} from "@/lib/supabaseServer";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  const userId = (session as any).userId as string | undefined;
  if (!userId) {
    return NextResponse.json({error: "Missing user id"}, {status: 400});
  }

  const supabase = getSupabaseAdmin();
  const {data, error} = await supabase
    .from("files")
    .select("*")
    .eq("user_identifier", userId)
    .order("created_at", {ascending: false});

  if (error) {
    return NextResponse.json({error: error.message}, {status: 500});
  }

  return NextResponse.json(data ?? []);
}
