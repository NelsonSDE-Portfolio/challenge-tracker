import type { Context } from "https://edge.netlify.com";

// Default allowed origins for production
const DEFAULT_ALLOWED_ORIGINS = [
  "https://nelsonriera.com",
  "https://www.nelsonriera.com",
  "https://portfolio-host.netlify.app",
];

function getAllowedOrigins(): string[] {
  // Use ALLOWED_ORIGINS env var if set, otherwise use defaults
  const envOrigins = Netlify.env.get("ALLOWED_ORIGINS");
  if (envOrigins) {
    return envOrigins.split(",").map((origin) => origin.trim());
  }
  return DEFAULT_ALLOWED_ORIGINS;
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
}

export default async (request: Request, context: Context) => {
  const origin = request.headers.get("origin");

  // Handle preflight OPTIONS requests
  if (request.method === "OPTIONS") {
    const headers = new Headers();
    if (isOriginAllowed(origin)) {
      headers.set("Access-Control-Allow-Origin", origin!);
      headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      headers.set("Access-Control-Max-Age", "86400");
    }
    return new Response(null, { status: 204, headers });
  }

  const response = await context.next();

  // Add CORS headers only for allowed origins
  if (isOriginAllowed(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin!);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  return response;
};

export const config = {
  path: "/*",
};
