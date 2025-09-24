import {auth} from "@/lib/auth";
import {redirect} from "next/navigation";
import Dropzone from "@/components/Dropzone";
import Filelist from "@/components/Filelist";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="h-[calc(100vh-4.5rem)] flex items-stretch">
      <div className="w-1/4 h-full">
        <Dropzone />
      </div>
      <div className="w-3/4 h-full">
        <Filelist />
      </div>
    </div>
  );
}
