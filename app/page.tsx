import Link from "next/link";
import Animation from "@/components/Animation";
import {auth} from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  const href = session?.user
    ? "/dashboard"
    : "/api/auth/signin?callbackUrl=/dashboard";

  return (
    <div className="flex flex-col lg:flex-row flex-1 overflow-auto items-center">
      <div className="w-1/2 flex flex-col justify-center pl-30 space-y-6">
        <div className="font-semibold text-6xl">
          <p>Your files.</p>
          <p>Your vault.</p>
        </div>
        <p className="text-2xl text-stone-500">
          Enhance your personal storage with Clovault—a simple way to upload,
          organize, and access your files from anywhere. Securely store
          important documents and media, and enjoy effortless file management in
          one central hub.
        </p>
        <Link
          href={href}
          className="flex btn text-xl text-white bg-blue-500 hover:bg-blue-600 w-1/3 h-16 rounded-2xl"
        >
          <p>Get Started</p>
          <p className="text-3xl pb-1">&#8594;</p>
        </Link>
      </div>
      <div className="w-1/2">
        <Animation />
      </div>
    </div>
  );
}
