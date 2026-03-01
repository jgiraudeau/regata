import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        const envUser = process.env.APP_USER;
        const envPwd = process.env.APP_PASSWORD;

        if (!envUser || !envPwd) {
            // Si pas de sécurité configurée, on autorise tout
            const res = NextResponse.json({ success: true });
            res.cookies.set('auth_token', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 1 semaine
            });
            return res;
        }

        if (username === envUser && password === envPwd) {
            const res = NextResponse.json({ success: true });
            res.cookies.set('auth_token', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 * 7
            });
            return res;
        }

        return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
