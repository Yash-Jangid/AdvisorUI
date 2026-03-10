import { Text } from '@/components/atoms/Text';

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text variant="h3" className="font-semibold text-text-primary">
          Users Management
        </Text>
        <Text variant="body" color="secondary" className="mt-1">
          Search, view, and manage all users across the platform.
        </Text>
      </div>

      <div className="flex items-center justify-center p-12 border border-dashed border-border rounded-xl">
        <Text color="secondary">Users management module coming soon.</Text>
      </div>
    </div>
  );
}
