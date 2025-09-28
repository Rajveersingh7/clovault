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
    <div className="h-[calc(100vh-4.5rem)] flex flex-col md:flex-row items-stretch">
      <div className="w-full md:w-1/3 lg:w-1/4 h-48 md:h-full border-b md:border-b-0 md:border-r border-stone-200">
        <Dropzone />
      </div>
      <div className="w-full md:w-2/3 lg:w-3/4 flex-1 md:h-full overflow-hidden">
        <Filelist />
      </div>
    </div>
  );
}
