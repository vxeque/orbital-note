import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Chequear token en cookies o headers
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('x-auth-token');
  const pathname = request.nextUrl.pathname;
  const hostname = request.nextUrl.hostname;

  // Si es el subdominio de docs, permitir acceso público
  if (hostname?.includes('docs.')) {
    return NextResponse.next();
  }

  // Rutas públicas en la app principal (sin autenticación requerida)
  const publicRoutes = ['/login', '/auth', '/(auth)'];
  
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Si no hay token y no está en ruta pública, redirigir a login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
