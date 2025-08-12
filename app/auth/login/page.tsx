import { auth } from "@/auth";
import { GalleryVerticalEnd } from "lucide-react";
import { redirect } from "next/navigation";
import { LoginForm } from "./components/sign-in-form";
import { VerificationSuccessAlert } from "./components/verification-success-alert";

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ verification: string }>;
}) {
  const { verification } = await searchParams;

  const session = await auth();

  if (session) {
    redirect("/productos");
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10">
      {verification === "success" && <VerificationSuccessAlert />}
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          {process.env.NEXT_PUBLIC_CLIENT_NAME}
        </a>
        <LoginForm />
      </div>
    </div>
  );
}
