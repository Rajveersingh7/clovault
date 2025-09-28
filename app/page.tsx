import Link from "next/link";
import Animation from "@/components/Animation";
import {auth} from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  const href = session?.user
    ? "/dashboard"
    : "/api/auth/signin?callbackUrl=/dashboard";

  return (
    <div className="flex flex-col lg:flex-row flex-1 overflow-auto items-center px-4 lg:px-0">
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-8 lg:py-0 lg:pl-30 space-y-4 md:space-y-6">
        <div className="font-semibold text-4xl md:text-5xl lg:text-6xl">
          <p>Your files.</p>
          <p>Your vault.</p>
        </div>
        <p className="text-lg md:text-xl lg:text-2xl text-stone-500">
          Enhance your personal storage with Clovault—a simple way to upload,
          organize, and access your files from anywhere. Securely store
          important documents and media, and enjoy effortless file management in
          one central hub.
        </p>
        <Link
          href={href}
          className="flex btn text-base md:text-lg lg:text-xl text-white bg-blue-500 hover:bg-blue-600 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 h-14 md:h-16 rounded-2xl justify-center items-center"
        >
          <p>Get Started</p>
          <p className="text-2xl md:text-3xl pb-1 ml-2">&#8594;</p>
        </Link>
      </div>
      <div className="w-full lg:w-1/2 py-8 lg:py-0">
        <Animation />
      </div>
    </div>
  );
}
