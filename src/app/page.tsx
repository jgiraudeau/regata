import { cookies } from 'next/headers';
import AppClient from './AppClient';
import Landing from '../components/Landing';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  const envUser = process.env.APP_USER;
  const envPwd = process.env.APP_PASSWORD;

  const isProtected = !!(envUser && envPwd);
  const isAuthenticated = !isProtected || token === 'authenticated';

  if (!isAuthenticated) {
    return <Landing />;
  }

  return <AppClient />;
}
