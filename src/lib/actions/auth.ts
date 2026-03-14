"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/lib/validations/auth";

type FieldErrors = Record<string, string[] | undefined>;

export type AuthActionState =
  | {
      error: {
        _global?: string[];
        fieldErrors?: FieldErrors;
      };
      success?: never;
    }
  | {
      error?: never;
      success: true;
    };

function validationError(fieldErrors: FieldErrors): AuthActionState {
  return {
    error: {
      fieldErrors,
    },
  };
}

function globalError(message: string): AuthActionState {
  return {
    error: {
      _global: [message],
    },
  };
}

export async function login(values: LoginInput): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return globalError(error.message);
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function register(values: RegisterInput): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse(values);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { email, fullName, password } = parsed.data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return globalError(error.message);
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}
