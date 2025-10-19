import { useEffect } from "react";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";

export default function AutoSignin() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function signin() {
      try {
        console.log("Attempting signin...");
        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@admin.com",
            password: "test123"
          }),
        });

        console.log("Response status:", res.status);
        
        if (res.ok) {
          console.log("Signin successful!");
          await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
          setLocation("/dashboard");
        } else {
          const error = await res.json();
          console.error("Signin failed:", error);
          alert("Signin failed: " + JSON.stringify(error));
        }
      } catch (error) {
        console.error("Exception:", error);
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
