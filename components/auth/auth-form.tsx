import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/lib/client";

export function AuthForm() {
  const supabase = createClient();

  return (
    <Auth
      supabaseClient={supabase}
      view="sign_in"
      appearance={{ theme: ThemeSupa }}
      theme="light"
      showLinks={true}
      providers={["google"]}
      redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`}
    />
  );
}
