'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function AuthError() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('An authentication error occurred');
  
  useEffect(() => {
    const error = searchParams.get('error');
    
    if (error === 'CredentialsSignin') {
      setErrorMessage('Invalid Badge ID. Please try again.');
    } else if (error === 'BadgeIdRequired') {
      setErrorMessage('Badge ID is required. Please enter your Badge ID.');
    } else if (error) {
      setErrorMessage(`Authentication error: ${error}`);
    }
  }, [searchParams]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card title="Authentication Error" className="w-full max-w-md">
        <div className="space-y-6">
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            {errorMessage}
          </div>
          
          <div className="flex justify-center">
            <Link href="/auth/login">
              <Button>Return to Login</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
