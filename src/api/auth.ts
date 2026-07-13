import { supabase } from "./client";

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getCurrentSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthStateChange(callback: () => void) {
  if (!supabase) return () => undefined;

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(() => callback());

  return () => subscription.unsubscribe();
}
