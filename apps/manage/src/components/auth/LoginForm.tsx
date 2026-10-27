"use client";

import { useActionState } from "react";
import { Alert, Button, Field, Input } from "@repo/ui";
import { login, type LoginState } from "@/lib/actions/auth";

const INITIAL: LoginState = { error: "" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Username" htmlFor="username">
        <Input
          id="username"
          name="username"
          autoComplete="username"
          required
          autoFocus
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
