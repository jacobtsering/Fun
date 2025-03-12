import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Badge ID',
      credentials: {
        badgeId: { label: "Badge ID", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.badgeId) {
          throw new Error("Badge ID is required");
        }

        try {
          // Find user by badge ID
          const user = await prisma.user.findUnique({
            where: {
              badgeId: credentials.badgeId,
            },
            include: {
              company: true,
            },
          });

          if (!user) {
            throw new Error("Invalid Badge ID");
          }

          // Return user object with role information
          return {
            id: user.id,
            name: user.name,
            role: user.role,
            companyId: user.companyId,
            companyName: user.company.name,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error(error instanceof Error ? error.message : "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyId = user.companyId;
        token.companyName = user.companyName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.companyId = token.companyId;
        session.user.companyName = token.companyName;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
