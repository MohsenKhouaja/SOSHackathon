import { Alert, AlertTitle } from "@repo/ui/components/ui/alert";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { AlertCircleIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useSigninMutation } from "@/api/mutations/auth-mutations";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  // Check for pending invitation in sessionStorage
  useEffect(() => {
    const pendingInvitation = sessionStorage.getItem("pendingInvitation");
    if (pendingInvitation && !redirectTo) {
      // If there's a pending invitation and no explicit redirect, redirect to invitation page after login
      sessionStorage.setItem("loginRedirect", `/invite/${pendingInvitation}`);
    }
  }, [redirectTo]);

  const { mutate: signin, isPending } = useSigninMutation(
    (err: string) => {
      setError(err);
    },
    () => {
      // Check for stored redirect or pending invitation
      const storedRedirect = sessionStorage.getItem("loginRedirect");
      sessionStorage.removeItem("loginRedirect");

      if (redirectTo) {
        navigate(redirectTo);
      } else if (storedRedirect) {
        navigate(storedRedirect);
      } else {
        navigate("/");
      }
    }
  );

  const handleSignin = () => {
    signin({ email, password, rememberMe });
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {error && (
            <Alert className="rounded-md text-destructive! shadow">
              <AlertCircleIcon className="text-destructive!" />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              placeholder="m@example.com"
              required
              type="email"
              value={email}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link className="ml-auto inline-block text-sm underline" to="#">
                Forgot your password?
              </Link>
            </div>

            <Input
              autoComplete="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              type="password"
              value={password}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              onClick={() => {
                setRememberMe(!rememberMe);
              }}
            />
            <Label htmlFor="remember">Remember me</Label>
          </div>

          <Button
            className="w-full"
            disabled={isPending}
            onClick={handleSignin}
            type="submit"
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              "Sign In"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
