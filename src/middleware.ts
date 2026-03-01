import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const basicAuth = req.headers.get('authorization');

    // Si l'utilisateur a configuré un mot de passe et un identifiant dans les variables d'environnement
    const user = process.env.APP_USER;
    const pwd = process.env.APP_PASSWORD;

    // Si les variables ne sont pas définies (ex: en dev local), on ne bloque pas
    if (!user || !pwd) {
        return NextResponse.next();
    }

    if (basicAuth) {
        const authValue = basicAuth.split(' ')[1];
        const [providedUser, providedPwd] = atob(authValue).split(':');

        if (providedUser === user && providedPwd === pwd) {
            return NextResponse.next();
        }
    }

    return new NextResponse('Auth required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Accès sécurisé à Regatta"',
        },
    });
}

// On protège tout Sauf l'API (pour que Vercel puisse l'appeler depuis l'extérieur sans mot de passe en arrière-plan)
// et les fichiers statiques (_next).
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
