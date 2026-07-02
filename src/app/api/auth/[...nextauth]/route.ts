import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NextRequest } from 'next/server';

const handler = NextAuth(authOptions);

type RouteParams = {
  params: {
    nextauth: string[];
  };
};

async function GET(req: NextRequest, context: RouteParams) {
  return handler(req, context);
}

async function POST(req: NextRequest, context: RouteParams) {
  return handler(req, context);
}

export { GET, POST };
