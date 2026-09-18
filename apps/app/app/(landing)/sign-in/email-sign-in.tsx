"use client";

import { signIn, signUp } from "@crm/auth/client";
import { Button } from "@crm/ui/components/button";
import {
	Field,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { Spinner } from "@crm/ui/components/spinner";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";

export function EmailSignIn() {
	const router = useRouter();
	const emailId = useId();
	const passwordId = useId();
	const nameId = useId();
	const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
	const [pending, setPending] = useState(false);

	async function submit(form: HTMLFormElement) {
		setPending(true);
		const data = new FormData(form);
		const email = String(data.get("email") ?? "").trim();
		const password = String(data.get("password") ?? "");
		const name = String(data.get("name") ?? "").trim();

		try {
			const result =
				mode === "sign-up"
					? await signUp.email({
							email,
							password,
							name: name || email.split("@")[0] || "LINK user",
						})
					: await signIn.email({ email, password });

			if (result.error) {
				toast.error(result.error.message);
				return;
			}

			router.replace("/");
			router.refresh();
		} catch {
			toast.error("Could not reach the sign-in service.");
		} finally {
			setPending(false);
		}
	}

	return (
		<div className="flex flex-col gap-5">
			<form
				className="flex flex-col gap-5"
				onSubmit={(event) => {
					event.preventDefault();
					void submit(event.currentTarget);
				}}
			>
				<FieldGroup>
					{mode === "sign-up" ? (
						<Field>
							<FieldLabel htmlFor={nameId}>Name</FieldLabel>
							<Input
								id={nameId}
								name="name"
								autoComplete="name"
								required
							/>
						</Field>
					) : null}

					<Field>
						<FieldLabel htmlFor={emailId}>Email</FieldLabel>
						<Input
							id={emailId}
							name="email"
							type="email"
							autoComplete="email"
							required
							autoFocus
						/>
					</Field>

					<Field>
						<FieldLabel htmlFor={passwordId}>Password</FieldLabel>
						<Input
							id={passwordId}
							name="password"
							type="password"
							autoComplete={
								mode === "sign-up" ? "new-password" : "current-password"
							}
							minLength={8}
							required
						/>
					</Field>
				</FieldGroup>

				<Button type="submit" disabled={pending}>
					{pending ? <Spinner data-icon="inline-start" /> : null}
					{mode === "sign-up" ? "Create LINK account" : "Sign in"}
				</Button>
			</form>

			<Button
				type="button"
				variant="ghost"
				disabled={pending}
				onClick={() =>
					setMode((current) =>
						current === "sign-in" ? "sign-up" : "sign-in",
					)
				}
			>
				{mode === "sign-in"
					? "First time? Create account"
					: "Already have an account? Sign in"}
			</Button>
		</div>
	);
}
