import type { Metadata } from "next";
import { AuthHeading, AuthShell } from "@/components/auth-shell";
import { EmailSignIn } from "./email-sign-in";

export const metadata: Metadata = {
	title: "Sign in",
};

export default function SignInPage() {
	return (
		<AuthShell>
			<AuthHeading
				title="Welcome to LINK"
				description="Use your approved email to enter the operational CRM."
			/>
			<EmailSignIn />
		</AuthShell>
	);
}
