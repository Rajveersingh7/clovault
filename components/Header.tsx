import Image from "next/image";
import Link from "next/link";
import Cloud from "../public/cloud.png";
import {auth} from "@/lib/auth";

export default async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-stone-200 bg-white h-16 md:h-18 flex justify-between items-center px-4 md:px-7">
      <Link href="/" className="flex items-center space-x-1 md:space-x-1.5">
        <Image src={Cloud} alt="logo" height={35} width={35} className="md:h-[45px] md:w-[45px]" />
        <p className="font-bold text-xl md:text-2xl">Clovault</p>
      </Link>
      <div className="flex items-center space-x-2">
        {session?.user ? (
          <Link
            href="/api/auth/signout?callbackUrl=/"
            className="btn btn-sm md:btn-md text-white bg-blue-500 hover:bg-blue-600 border border-gray-200 rounded-lg shadow-sm px-3 md:px-4"
          >
            Sign out
          </Link>
        ) : (
          <>
            <Link
              href="/api/auth/signin?callbackUrl=/dashboard"
              className="hidden sm:inline-flex btn btn-sm md:btn-md text-black bg-white hover:bg-stone-100 border border-gray-200 rounded-lg shadow-sm"
            >
              Log in
            </Link>
            <Link
              href="/api/auth/signin?callbackUrl=/dashboard"
              className="btn btn-sm md:btn-md text-white bg-blue-500 hover:bg-blue-600 border border-gray-200 rounded-lg shadow-sm px-3 md:px-4"
            >
              <span className="hidden sm:inline">Sign up</span>
              <span className="sm:hidden">Get Started</span>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
