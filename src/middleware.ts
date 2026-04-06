import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/login', '/verify-magic-link', '/registrar', '/recuperar-senha'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Ignorar arquivos estáticos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/logo') ||
    pathname.startsWith('/icon') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.svg')
  ) {
    return NextResponse.next();
  }

  // Rotas públicas — acesso sem token
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Todas as outras rotas precisam de autenticação
  const token = request.cookies.get('tl_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|icon.png).*)',
  ],
};
