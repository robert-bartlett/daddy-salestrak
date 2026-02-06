import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { ContactForm } from './components/_contact-form';

/**
 * Native iOS Create Contact Sheet
 * Stacks on top of add-sheet when user selects "Contact"
 */
export default function CreateContactSheet() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return <ContactForm onBack={handleBack} />;
}
