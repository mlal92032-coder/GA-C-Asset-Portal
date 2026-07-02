import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rate-limiter';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          console.error('[AUTH] Missing email or password');
          throw new Error('Email and password are required');
        }

        console.log('[AUTH] Login attempt for:', credentials.email);

        // Rate limit based on email
        const rateLimitResult = rateLimit(credentials.email, {
          maxRequests: 5,
          windowMs: 15 * 60 * 1000, // 15 minutes
        });

        if (!rateLimitResult.success) {
          console.error('[AUTH] Rate limit exceeded for:', credentials.email);
          throw new Error('Too many login attempts. Please try again later.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.error('[AUTH] User not found:', credentials.email);
          throw new Error('No user found with this email');
        }

        console.log('[AUTH] User found:', user.email, 'Status:', user.status);

        if (user.status === 'INACTIVE') {
          console.error('[AUTH] User inactive:', credentials.email);
          throw new Error('Your account has been deactivated. Please contact an administrator.');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          console.error('[AUTH] Invalid password for:', credentials.email);
          throw new Error('Invalid password');
        }

        console.log('[AUTH] Login successful for:', user.email);

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role,
          status: user.status,
          permissions: user.permissions,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('[JWT] Token callback - user:', user ? JSON.stringify({ email: user.email, id: user.id, role: user.role }) : 'null');
      console.log('[JWT] Token.sub:', token.sub);
      if (user) {
        console.log('[JWT] Setting token data');
        token.id = user.id;
        token.role = user.role as string;
        token.status = user.status as string;
        token.permissions = user.permissions as string | null;
      }
      console.log('[JWT] Returning token:', JSON.stringify({ sub: token.sub, id: token.id, role: token.role }));
      return token;
    },
    async session({ session, token }) {
      console.log('[SESSION] Session callback - token:', JSON.stringify({ sub: token.sub, id: token.id, role: token.role }));
      console.log('[SESSION] Session user before:', session.user ? JSON.stringify({ name: session.user.name, email: session.user.email }) : 'null');
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
        session.user.permissions = token.permissions as string | null;
      }
      console.log('[SESSION] Session user after:', session.user ? JSON.stringify({ id: session.user.id, role: session.user.role }) : 'null');
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      status: string;
      permissions: string | null;
    };
  }
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    permissions: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    status: string;
    permissions: string | null;
  }
}
