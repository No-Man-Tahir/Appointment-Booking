import {
  SignupForm,
} from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-semibold">
          Create account
        </h1>

        <SignupForm />
      </div>
    </main>
  );
}