import { ROUTES } from '@/lib/constants/routes';
import { redirect } from 'next/navigation';

// Root page — redirect to dashboard (middleware handles auth guard)
export default function RootPage() {
  redirect(ROUTES.user.dashboard);
}
