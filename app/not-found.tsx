import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-6">
      <div className="text-center space-y-5 max-w-md animate-fade-in">
        <div className="text-8xl font-black text-primary opacity-30">404</div>
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href={ROUTES.user.dashboard}
          className="inline-flex items-center px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
