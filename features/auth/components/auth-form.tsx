"use client";

import { Eye, EyeOff, Layers3, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login, register } from "@/features/auth/services/auth-api";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { getApiErrorMessage } from "@/services/api-client";
import { loginSchema, registerSchema } from "@/validations/auth";

type AuthMode = "login" | "register";
type Fields = { name: string; email: string; password: string };
type Errors = Partial<Record<keyof Fields, string>>;

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<Fields>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  function updateField(name: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const schema = mode === "register" ? registerSchema : loginSchema;
    const payload =
      mode === "register"
        ? fields
        : { email: fields.email, password: fields.password };
    const result = schema.safeParse(payload);

    if (!result.success) {
      const validationErrors: Errors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof Fields;
        validationErrors[field] ??= issue.message;
      }
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const auth =
        mode === "register"
          ? await register(registerSchema.parse(payload))
          : await login(loginSchema.parse(payload));
      setSession(auth.accessToken, auth.user);
      setInitialized(true);
      toast.success(
        mode === "register" ? "Your account is ready." : "Welcome back.",
      );
      router.replace("/dashboard");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const isRegister = mode === "register";

  return (
    <>
      <div className="mb-8 flex items-center gap-3 lg:hidden">
        <span className="grid size-10 place-items-center rounded-xl bg-primary text-white">
          <Layers3 className="size-5" />
        </span>
        <span className="text-xl font-bold">Taskflow</span>
      </div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-primary">
          {isRegister ? "Start your workspace" : "Welcome back"}
        </p>
        <h2 className="text-3xl font-bold tracking-tight">
          {isRegister ? "Create your account" : "Sign in to Taskflow"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {isRegister
            ? "A better way to organize your work starts here."
            : "Continue where you left off and keep making progress."}
        </p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {isRegister && (
          <Field label="Full name" error={errors.name}>
            <Input
              autoComplete="name"
              placeholder="Your name"
              value={fields.name}
              onChange={(event) => updateField("name", event.target.value)}
            />
          </Field>
        )}
        <Field label="Email address" error={errors.email}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={fields.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder={
                isRegister ? "At least 8 characters" : "Your password"
              }
              value={fields.password}
              onChange={(event) => updateField("password", event.target.value)}
              className="pr-11"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </Field>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
         {loading && <LoaderCircle className="size-4 animate-spin" />}
          {isRegister ? "Create account" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        {isRegister ? "Already have an account?" : "New to Taskflow?"}{" "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="font-semibold text-primary hover:underline"
        >
          {isRegister ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      {children}
      {error && (
        <span className="mt-1.5 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
}
