"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, LockKeyhole, Mail, User2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { register, type AuthActionState } from "@/lib/actions/auth";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const [serverState, setServerState] = useState<AuthActionState | null>(null);
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  async function onSubmit(values: RegisterInput) {
    setServerState(null);

    const result = await register(values);

    if (result.error) {
      setServerState(result);

      if (result.error._global?.[0]) {
        toast.error(result.error._global[0]);
      }

      return;
    }

    toast.success("Account created successfully.");
    router.push("/dashboard");
    router.refresh();
  }

  const fullNameError =
    form.formState.errors.fullName?.message ??
    serverState?.error?.fieldErrors?.fullName?.[0];
  const emailError =
    form.formState.errors.email?.message ??
    serverState?.error?.fieldErrors?.email?.[0];
  const passwordError =
    form.formState.errors.password?.message ??
    serverState?.error?.fieldErrors?.password?.[0];
  const confirmPasswordError =
    form.formState.errors.confirmPassword?.message ??
    serverState?.error?.fieldErrors?.confirmPassword?.[0];
  const globalError = serverState?.error?._global?.[0];

  return (
    <Card className="w-full max-w-md rounded-3xl border-slate-700/80 bg-slate-800/95 shadow-2xl shadow-black/30 backdrop-blur">
      <CardHeader className="space-y-2 px-8 pt-8">
        <CardTitle className="text-3xl font-semibold text-slate-100">
          Create account
        </CardTitle>
        <p className="text-sm text-slate-400">
          Provision your treasury workspace and start monitoring cash in real time.
        </p>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <div className="space-y-2">
            <Label
              className="text-sm font-medium text-slate-300"
              htmlFor="fullName"
            >
              Full name *
            </Label>
            <div className="relative">
              <User2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Avery Chen"
                className="h-11 border-slate-600 bg-slate-900 pl-10 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                aria-invalid={Boolean(fullNameError)}
                {...form.register("fullName")}
              />
            </div>
            <FormError message={fullNameError} />
          </div>

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
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                className="h-11 border-slate-600 bg-slate-900 pl-10 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                aria-invalid={Boolean(passwordError)}
                {...form.register("password")}
              />
            </div>
            <FormError message={passwordError} />
          </div>

          <div className="space-y-2">
            <Label
              className="text-sm font-medium text-slate-300"
              htmlFor="confirmPassword"
            >
              Confirm password *
            </Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                className="h-11 border-slate-600 bg-slate-900 pl-10 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
                aria-invalid={Boolean(confirmPasswordError)}
                {...form.register("confirmPassword")}
              />
            </div>
            <FormError message={confirmPasswordError} />
          </div>

          {globalError ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{globalError}</p>
            </div>
          ) : null}

          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="h-11 w-full bg-green-600 text-white hover:bg-green-500 focus-visible:ring-green-500/30"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>

          <p className="text-center text-sm text-slate-400">
            Already have access?{" "}
            <Link
              href="/login"
              className="font-medium text-green-400 transition hover:text-green-300 focus:outline-none focus-visible:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
