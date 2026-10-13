---
name: api-documentation
description: Generate comprehensive documentation for API routes with request/response examples. Use when creating new API endpoints or updating existing ones.
---

# API Documentation

## Instructions

### Step 1: Scan API Routes
- Read all files in `src/app/api/`
- Identify route pattern: `src/app/api/[resource]/route.ts`
- List HTTP methods supported (GET, POST, PUT, DELETE, PATCH)
- Note route parameters and query strings

### Step 2: Extract Route Details
For each route, document:
- **Path**: Full API endpoint (e.g., `/api/assets/[id]/checkout-history`)
- **Methods**: GET, POST, PUT, DELETE, PATCH
- **Purpose**: What the endpoint does
- **Auth Required**: Yes/No, required roles
- **Rate Limits**: If any

### Step 3: Document Request/Response
- **Request Body**: TypeScript interface or JSON schema
- **Query Parameters**: List all accepted params and types
- **Path Parameters**: Document dynamic segments
- **Response Success**: JSON structure with example
- **Response Errors**: Common error codes and messages
- **Status Codes**: 200, 201, 400, 401, 403, 404, 500, etc.

### Step 4: Add Examples
- Include cURL examples for testing
- Provide JavaScript/TypeScript client examples
- Show real request/response data
- Include pagination examples if applicable

### Step 5: Document Auth & Permissions
- List required roles for each endpoint
- Document permission checks (middleware)
- Note rate limiting behavior
- Explain token requirements

### Step 6: Create API Reference Doc
- Generate `docs/API.md` in project root
- Organize by resource (assets, employees, audit-logs, etc.)
- Add table of contents with links
- Include base URL and authentication info

### Step 7: Update Project README
- Add API documentation link
- Include quick start example
- Link to full API reference
- Document environment variables needed

