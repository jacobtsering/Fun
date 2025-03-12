"use client";

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import BarcodeInput from '@/components/forms/BarcodeInput';

export default function LoginPage() {
  const [badgeId, setBadgeId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/operator');
      }
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(badgeId);
  };

  const handleScan = async (data: string) => {
    await handleLogin(data);
  };

  const handleLogin = async (id: string) => {
    if (!id.trim()) {
      setError('Badge ID is required');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        badgeId: id.trim(),
        redirect: false,
      });
      
      if (result?.error) {
        setError('Invalid badge ID. Please try again.');
      } else if (result?.ok) {
        // Let the useEffect handle the redirect based on role
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
      setBadgeId('');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card title="Process Tracking Login" className="w-full max-w-md">
        <div className="space-y-6">
          <p className="text-center text-gray-600">
            Scan your badge or enter your Badge ID to login
          </p>
          
          <BarcodeInput 
            onScan={handleScan} 
            placeholder="Scan or type your Badge ID..." 
            buttonText="Login"
            autoFocus={true}
          />
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md">
              {error}
            </div>
          )}
          
          {isLoading && (
            <div className="text-center text-gray-600">
              Authenticating...
            </div>
          )}
          
          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-500 mb-2">Test credentials:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <span className="font-medium">Admin:</span> ADMIN001
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="font-medium">Operator:</span> OP001
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
