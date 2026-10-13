import { useSession } from 'next-auth/react';

/**
 * Hook for delete operations with conditional confirmation
 * SUPER_ADMIN can delete directly without confirmation
 * Other roles need confirmation
 */
export function useDeleteWithConfirm() {
  const { data: session } = useSession();

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  /**
   * Check if delete should proceed
   * @param message - Confirmation message for non-admin users
   * @returns true if deletion should proceed, false otherwise
   */
  const shouldDelete = (message: string = 'Are you sure you want to delete this item?'): boolean => {
    // SUPER_ADMIN can delete directly without confirmation
    if (isSuperAdmin) {
      return true;
    }

    // Other roles need confirmation
    return confirm(message);
  };

  return {
    isSuperAdmin,
    shouldDelete,
  };
}
