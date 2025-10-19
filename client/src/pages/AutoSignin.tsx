import { useEffect } from "react";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";

export default function AutoSignin() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function signin() {
      try {
        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@admin.com",
            password: "test123"
          }),
        });

        if (res.ok) {
          await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
          setLocation("/dashboard");
        } else {
          const error = await res.json();
          alert("Signin failed: " + error.message);
        }
      } catch (error) {
        alert("Error: " + error);
      }
    }

    signin();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Signing you in...</h1>
        <p className="text-muted-foreground">Please wait</p>
      </div>
    </div>
  );
}
