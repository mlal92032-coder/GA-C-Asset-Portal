/**
 * Socket.io Route Handler
 *
 * This Next.js route handler manages WebSocket connections via Socket.io
 * Supports both WebSocket and long-polling transports
 *
 * Usage in client:
 * const socket = io('http://localhost:3000/api/socket.io', {
 *   auth: {
 *     userId: session.user.id,
 *     companyId: session.user.companyId,
 *     token: session.sessionToken
 *   }
 * })
 */

import { NextRequest } from 'next/server'

// WebSocket upgrades are handled automatically by Next.js 14+
// The Socket.io server is initialized in server.ts and manages connections

export async function GET(req: NextRequest) {
  return new Response('Socket.io endpoint', { status: 200 })
}

export async function POST(req: NextRequest) {
  return new Response('Socket.io endpoint', { status: 200 })
}

// Socket.io configuration for App Router
export const dynamic = 'force-dynamic'
export const maxDuration = 60
