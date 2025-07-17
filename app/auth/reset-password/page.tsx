import { Suspense } from "react";
import { ResetPasswordForm } from "./components/reset-password-form";
import { RecoverPasswordForm } from "./components/recover-password-form";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <div className="flex items-center justify-center p-4 mt-20">
      <Suspense fallback={<div>Loading...</div>}>
        {token ? <ResetPasswordForm token={token} /> : <RecoverPasswordForm />}
      </Suspense>
    </div>
  );
}
