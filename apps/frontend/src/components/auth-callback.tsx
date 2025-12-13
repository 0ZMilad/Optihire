"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCountdown } from "@/hooks/use-countdown";
import { getAuthErrorMessage, AuthErrorMap } from "@/lib/auth-errors";
import { authService } from "@/middle-service/supabase";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

type AuthCallbackType = 'recovery' | 'signup' | 'invite' | 'email_change' | 'magiclink';
type CallbackStatus = 'loading' | 'success' | 'error';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [errorDetails, setErrorDetails] = useState<AuthErrorMap | null>(null);
  const [callbackType, setCallbackType] = useState<AuthCallbackType | null>(null);

  const type = searchParams.get("type");
  const error = searchParams.get("error");
  const errorCode = searchParams.get("error_code");

  const redirectUser = () => {
    if (status === 'error') {
      router.push('/login');
      return;
    }

    const targetType = callbackType || (type as AuthCallbackType);

    if (targetType === 'recovery') {
      router.push('/reset-password');
    } else if (targetType === 'signup') {
      router.push('/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const { seconds, start } = useCountdown(3, redirectUser);

  const handleCallback = async () => {
    if (error || errorCode) {
      const errorInfo = getAuthErrorMessage(errorCode || 'default');
      setErrorDetails(errorInfo);
      setStatus('error');
      return;
    }

    const detectedType = (type as AuthCallbackType) || 'recovery';
    setCallbackType(detectedType);

    const { data, error: sessionError } = await authService.getSession();

    if (sessionError || !data.session) {
      setErrorDetails(getAuthErrorMessage('token_not_found'));
      setStatus('error');
      return;
    }

    setStatus('success');
    start();
  };

  useEffect(() => {
    handleCallback();
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Spinner className="h-10 w-10 text-primary" />
        <h2 className="text-xl font-semibold">Verifying your link...</h2>
      </div>
    );
  }

  if (status === 'error' && errorDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-md mx-auto text-center px-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">{errorDetails.title}</h2>
        <p className="text-gray-600 mb-8">{errorDetails.message}</p>
        <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
          Return to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-md mx-auto text-center px-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-green-600 mb-2">
        {callbackType === 'recovery' ? 'Ready to Reset' : 'Email Verified!'}
      </h2>
      <p className="text-gray-600 mb-6">
        {callbackType === 'recovery'
          ? 'Your link is valid. Redirecting you to the password reset form...'
          : 'Your email has been successfully verified. Logging you in...'}
      </p>
      <p className="text-sm text-gray-400 mb-8">
        Redirecting in <span className="font-bold text-foreground">{seconds}</span> seconds
      </p>
      <Button onClick={redirectUser} className="w-full">
        Continue Now
      </Button>
    </div>
  );
}