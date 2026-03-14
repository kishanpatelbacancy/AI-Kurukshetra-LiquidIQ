"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { login, type AuthActionState } from "@/lib/actions/auth";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [serverState, setServerState] = useState<AuthActionState | null>(null);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  async function onSubmit(values: LoginInput) {
    setServerState(null);

    const result = await login(values);

    if (result.error) {
      setServerState(result);

      if (result.error._global?.[0]) {
        toast.error(result.error._global[0]);
      }

      return;
    }

    toast.success("Signed in successfully.");
    router.push("/dashboard");
    router.refresh();
  }

  const emailError =
    form.formState.errors.email?.message ??
    serverState?.error?.fieldErrors?.email?.[0];
  const passwordError =
    form.formState.errors.password?.message ??
    serverState?.error?.fieldErrors?.password?.[0];
  const globalError = serverState?.error?._global?.[0];

  return (
    <Card className="w-full max-w-md rounded-3xl border-slate-700/80 bg-slate-800/95 shadow-2xl shadow-black/30 backdrop-blur">
      <CardHeader className="space-y-2 px-8 pt-8">
        <CardTitle className="text-3xl font-semibold text-slate-100">
          Sign in
        </CardTitle>
        <p className="text-sm text-slate-400">
          Access bank accounts, forecasts, payments, and risk controls.
        </p>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-300" htmlFor="email">
              Work email *
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="treasury@liquidiq.com"
                className="h-11 border-slate-600 bg-slate-900 pl-10 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                aria-describedby="email-error"
                aria-invalid={Boolean(emailError)}
                {...form.register("email")}
              />
            </div>
            <FormError message={emailError} />
          </div>

          <div className="space-y-2">
            <Label
              className="text-sm font-medium text-slate-300"
              htmlFor="password"
            >
              Password *
            </Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                className="h-11 border-slate-600 bg-slate-900 pl-10 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                aria-describedby="password-error"
                aria-invalid={Boolean(passwordError)}
                {...form.register("password")}
              />
            </div>
            <FormError message={passwordError} />
          </div>

          {globalError ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{globalError}</p>
            </div>
          ) : null}

          <Button
            type="submit"
            variant="default"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="h-11 w-full bg-green-600 text-white hover:bg-green-500 focus-visible:ring-green-500/30"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <p className="text-center text-sm text-slate-400">
            Need access?{" "}
            <Link
              href="/register"
              className="font-medium text-green-400 transition hover:text-green-300 focus:outline-none focus-visible:underline"
            >
              Create an account
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
