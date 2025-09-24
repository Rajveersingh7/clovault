import Image from "next/image";
import Link from "next/link";
import Cloud from "../public/cloud.png";
import {auth} from "@/lib/auth";

export default async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-stone-200 bg-white h-18 flex justify-between px-7">
      <Link href="/" className="flex items-center space-x-1.5">
        <Image src={Cloud} alt="logo" height={45} width={45} />
        <p className="font-bold text-2xl">Clovault</p>
      </Link>
      <div className="flex items-center space-x-2 my-2">
        {session?.user ? (
          <Link
            href="/api/auth/signout?callbackUrl=/"
            className="btn text-white bg-blue-500 hover:bg-blue-600 border border-gray-200 rounded-lg shadow-sm"
          >
            Sign out
          </Link>
        ) : (
          <>
            <Link
              href="/api/auth/signin?callbackUrl=/dashboard"
              className="btn text-black bg-white hover:bg-stone-100 border border-gray-200 rounded-lg shadow-sm"
            >
              Log in
            </Link>
            <Link
              href="/api/auth/signin?callbackUrl=/dashboard"
              className="btn text-white bg-blue-500 hover:bg-blue-600 border border-gray-200 rounded-lg shadow-sm"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
