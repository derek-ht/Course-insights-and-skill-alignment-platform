import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

type JWTPayload = {
  sub: string;
  type: string;
  iat: number;
  exp: number;
};

export function middleware(request: NextRequest) {
  const jwt = request.cookies.get("jwt")?.value;
  let payload: JWTPayload | null = null;
  if (jwt) {
    payload = jwtDecode<JWTPayload>(jwt);
  }
  if (payload) {
    // If user is already logged in redirect them to dashboard
    if (request.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // If user tries to access their own profile through uId link redirect them to their profile
    if (request.nextUrl.pathname.startsWith(`/profile/${payload.sub}`)) {
      return NextResponse.redirect(new URL("/profile", request.url));
    }

    // If user isn't authenticated redirect them to login
  } else {
    if (request.nextUrl.pathname !== "/") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
}

export const config = {
  matcher: [
    "/dashboard",
    "/courses/:path*",
    "/groups/:path*",
    "/profile/:path*",
    "/projects/:path*",
    "/users",
    "/",
  ],
};
