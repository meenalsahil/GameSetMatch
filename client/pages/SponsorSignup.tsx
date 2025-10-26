import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import Footer from "@/components/Footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const sponsorSignupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Please enter your full name"),
  organization: z.string().optional(),
  contributionTypes: z.array(z.string()).min(1, "Please select at least one contribution type"),
  preferredPlayers: z.string().min(10, "Please describe your preferences"),
});

type SponsorSignupForm = z.infer<typeof sponsorSignupSchema>;

const contributionOptions = [
  { id: "travel", label: "Travel Funds" },
  { id: "miles", label: "Airline Miles" },
  { id: "hotel", label: "Hotel Points" },
  { id: "gear", label: "Equipment & Gear" },
  { id: "stipend", label: "Monthly Stipend" },
];

export default function SponsorSignup() {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<SponsorSignupForm>({
    resolver: zodResolver(sponsorSignupSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      organization: "",
      contributionTypes: [],
      preferredPlayers: "",
    },
  });

  const onSubmit = async (data: SponsorSignupForm) => {
    console.log("Sponsor signup data:", data);
    setIsSubmitted(true);
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof SponsorSignupForm)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ["email", "password", "fullName"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center py-20">
          <Card className="max-w-2xl w-full mx-6 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-6">
              <CheckCircle2 className="h-10 w-10 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-card-foreground mb-4">
              Welcome to GameSetMatch!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your account has been created. You can now browse players and start making a difference in their tennis careers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild data-testid="button-browse-players">
                <Link href="/players">
                  Browse Players
                </Link>
              </Button>
              <Button asChild variant="outline" data-testid="button-home">
                <Link href="/">
                  Back to Home
                </Link>
              </Button>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="bg-gradient-to-b from-accent/10 to-background py-12">
          <div className="container mx-auto px-6">
            <Button asChild variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <Link href="/how-it-works">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Become a Sponsor
            </h1>
            <p className="text-lg text-muted-foreground">
              Support tennis players at all levels and make a meaningful impact
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded-full mx-1 ${
                    s <= step ? "bg-accent" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Step {step} of 2
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-card-foreground mb-6">
                    Account Information
                  </h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                              data-testid="input-email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              data-testid="input-password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your full name"
                              data-testid="input-fullname"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="organization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Company or organization name"
                              data-testid="input-organization"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              )}

              {step === 2 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-card-foreground mb-6">
                    Sponsorship Preferences
                  </h2>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="contributionTypes"
                      render={() => (
                        <FormItem>
                          <FormLabel>How would you like to contribute?</FormLabel>
                          <FormDescription>
                            Select all that apply
                          </FormDescription>
                          <div className="space-y-3 mt-3">
                            {contributionOptions.map((option) => (
                              <FormField
                                key={option.id}
                                control={form.control}
                                name="contributionTypes"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(option.id)}
                                        onCheckedChange={(checked) => {
                                          const currentValue = field.value || [];
                                          const newValue = checked
                                            ? [...currentValue, option.id]
                                            : currentValue.filter((v) => v !== option.id);
                                          field.onChange(newValue);
                                        }}
                                        data-testid={`checkbox-${option.id}`}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferredPlayers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Player Preferences</FormLabel>
                          <FormDescription>
                            What type of players would you like to support? (e.g., location, ranking, specialization)
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the players you'd like to sponsor..."
                              className="min-h-[120px]"
                              data-testid="input-preferences"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              )}

              <div className="flex justify-between gap-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    data-testid="button-previous"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
                {step < 2 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto"
                    data-testid="button-next"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" className="ml-auto" data-testid="button-submit">
                    Create Account
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
