import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthErrorPayload = { message: string };
type AuthResponse = { error: AuthErrorPayload | null };

const toErrorPayload = (error: { message: string } | null): AuthErrorPayload | null => {
  if (!error) {
    return null;
  }

  return { message: error.message };
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    firewallApiKey: string,
    phoneNumber: string,
  ): Promise<AuthResponse> => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          firewall_api_key: firewallApiKey,
          phone_number: phoneNumber,
        },
      },
    });

    return { error: toErrorPayload(error) };
  };

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: toErrorPayload(error) };
  };

  const signOut = async (): Promise<AuthResponse> => {
    const { error } = await supabase.auth.signOut();

    return { error: toErrorPayload(error) };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };
};

