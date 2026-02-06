import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { AccountForm } from './components/_account-form';

/**
 * Native iOS Create Account Sheet
 * Stacks on top of add-sheet when user selects "Account"
 */
export default function CreateAccountSheet() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return <AccountForm onBack={handleBack} />;
}
