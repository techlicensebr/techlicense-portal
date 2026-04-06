import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = [
  '/bots',
  '/conversations',
  '/knowledge',
  '/analytics',
  '/api-keys',
  '/webhooks',
  '/settings',
  '/contacts',
  '/billing',
  '/channels',
];

const publicRoutes = ['/login', '/verify-magic-link'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Verificar se é uma rota pública
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Verificar token nos cookies
    const token = request.cookies.get('tl_token')?.value;

    if (!token) {
      // Redirecionar para login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Fazer match com todas as paths de requisição exceto:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (ícone favorito)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
