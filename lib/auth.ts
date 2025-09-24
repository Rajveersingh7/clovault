import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const {handlers, signIn, signOut, auth} = NextAuth({
  providers: [GitHub],
  trustHost: true,
  callbacks: {
    async jwt({token, account}) {
      if (account?.providerAccountId) {
        token.userId = account.providerAccountId;
      }
      return token;
    },
    async session({session, token}) {
      if (token?.userId) {
        (session as any).userId = token.userId;
      }
      return session;
    }
  }
});
