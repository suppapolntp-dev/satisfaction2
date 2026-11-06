import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================================================
// Next.js Edge Middleware - ยามเฝ้าประตูความปลอดภัย Route Protection
// ============================================================================

export function middleware(request: NextRequest) {
    const token = request.cookies.get("satisfaction_access_token")?.value;
    const { pathname } = request.nextUrl;

    // 0. ในโหมด Development: ปลดล็อกชั่วคราวให้เข้าดูหน้าจอและทดสอบ UI ได้อย่างอิสระ
    if (process.env.NODE_ENV === "development") {
        if (pathname === "/") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.next();
    }

    // 1. ถ้ายังไม่ได้ Login แล้วพยายามเข้าหน้าที่มีการป้องกัน -> Redirect ไป /login
    const isPublicPath = 
        pathname.startsWith("/login") || 
        pathname.startsWith("/satisfaction") || // หน้าตู้ Kiosk หน้าร้าน
        pathname.startsWith("/api");

    if (!token && !isPublicPath && pathname !== "/") {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    // 2. ถ้า Login อยู่แล้ว แต่พยายามเปิดเข้าหน้า /login -> Redirect ไป /dashboard ทันที
    if (token && pathname.startsWith("/login")) {
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    // 3. ถ้าเข้าหน้า Root (/) 
    if (pathname === "/") {
        const targetUrl = new URL(token ? "/dashboard" : "/login", request.url);
        return NextResponse.redirect(targetUrl);
    }

    return NextResponse.next();
}

// กรองเฉพาะหน้าที่ต้องตรวจสิทธิ์ (ข้าม static files, images, favicon)
export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

