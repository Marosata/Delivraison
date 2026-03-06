import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

function isAuthRoute(pathname: string) {
  return pathname.startsWith('/auth');
}

function isAdminRoute(pathname: string) {
  return pathname.startsWith('/admin');
}

function isLivreurRoute(pathname: string) {
  return pathname.startsWith('/livreur');
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('[mw] missing_env', { hasUrl: !!url, hasAnonKey: !!anonKey });
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  console.log('[mw] request', { pathname, hasUser: !!user });

  const needsAuth = isAdminRoute(pathname) || isLivreurRoute(pathname);
  const isAuthPage = isAuthRoute(pathname);

  if (!user) {
    if (needsAuth) {
      console.warn('[mw] unauthenticated_needsAuth_redirect', { pathname });
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('[mw] profile_fetch_error', { pathname, userId: user.id, profileError });
  } else {
    console.log('[mw] profile_fetch_success', { pathname, userId: user.id, role: profile?.role });
  }

  if (profileError || !profile?.role) {
    // Evite les boucles : si on est déjà sur /auth/*, on laisse la page s'afficher
    // afin que l'utilisateur voie l'erreur au lieu d'une redirection infinie.
    if (isAuthPage) {
      console.warn('[mw] missing_profile_on_auth_route_allow', { pathname, userId: user.id });
      return response;
    }

    console.warn('[mw] missing_profile_redirect_login', { pathname, userId: user.id });
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (isAuthPage) {
    return NextResponse.redirect(new URL(profile.role === 'admin' ? '/admin/dashboard' : '/livreur/dashboard', request.url));
  }

  if (isAdminRoute(pathname) && profile.role !== 'admin') {
    return NextResponse.redirect(new URL('/livreur/dashboard', request.url));
  }

  if (isLivreurRoute(pathname) && profile.role !== 'livreur') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|\.well-known).*)'],
};