// client/src/pages/PlayerSignup.tsx
import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Upload, X, Check, ChevronsUpDown, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Footer from "@/components/Footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Helper: is it ATP / ITF / WTA host?
const isOfficialTourHost = (value: string) => {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const allowedRoots = ["atptour.com", "itftennis.com", "wtatennis.com"];
    return allowedRoots.some(
      (root) => host === root || host.endsWith("." + root)
    );
  } catch {
    return false;
  }
};

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Please enter your full name"),
  age: z.string().min(1, "Please enter your age").refine(
    (val) => !val || parseInt(val) >= 14,
    { message: "You must be at least 14 years old" }
  ),
  country: z.string().min(2, "Please select your country"),
  location: z.string().min(2, "Please enter your location"),
  ranking: z.string().optional(),
  specialization: z.string().min(2, "Please specify your court specialization"),
  bio: z
    .string()
    .min(10, "Please tell us about your tennis journey (at least 10 characters)"),
  fundingGoals: z
    .string()
    .min(10, "Please describe what you're raising funds for (at least 10 characters)"),
  videoUrl: z.string().min(1, "Verification video link is required"),
  atpProfileUrl: z
    .string()
    .trim()
    .min(1, "ATP/ITF/WTA Profile URL is required")
    .refine(
      (value) => {
        if (!value) return true;
        return isOfficialTourHost(value);
      },
      {
        message: "Please enter a link to an official ATP, ITF, or WTA player profile",
      }
    ),
});

type SignupForm = z.infer<typeof signupSchema>;

const courtSpecializations = [
  "All Courts",
  "Hard Court",
  "Clay Court",
  "Grass Court",
  "Indoor",
];

// Complete list of all countries
const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

// Searchable Country Select Component
function CountrySelect({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    const query = searchQuery.toLowerCase();
    return countries.filter(country => 
      country.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value || "Select country..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder="Search countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8"
            autoFocus
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredCountries.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No country found.
            </div>
          ) : (
            filteredCountries.map((country) => (
              <div
                key={country}
                className={cn(
                  "flex items-center px-3 py-2 cursor-pointer hover:bg-accent",
                  value === country && "bg-accent"
                )}
                onClick={() => {
                  onChange(country);
                  setOpen(false);
                  setSearchQuery("");
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === country ? "opacity-100" : "opacity-0"
                  )}
                />
                {country}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// AI Enhance Button Component
function AIEnhanceButton({ 
  text, 
  type, 
  onEnhanced,
  disabled 
}: { 
  text: string;
  type: "bio" | "fundingGoals";
  onEnhanced: (enhanced: string) => void;
  disabled?: boolean;
}) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();

  const handleEnhance = async () => {
    if (!text || text.trim().length < 10) {
      toast({
        title: "Need more content",
        description: "Please write at least 10 characters before enhancing.",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const res = await fetch("/api/ai/enhance-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to enhance");
      }

      const data = await res.json();
      onEnhanced(data.enhanced);
      toast({
        title: "Enhanced!",
        description: "Your text has been improved by AI. Feel free to edit it further.",
      });
    } catch (error: any) {
      toast({
        title: "Enhancement failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleEnhance}
      disabled={disabled || isEnhancing || !text || text.trim().length < 10}
      className="gap-1.5 text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700"
    >
      {isEnhancing ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Enhancing...
        </>
      ) : (
        <>
          <Sparkles className="h-3.5 w-3.5" />
          Enhance with AI
        </>
      )}
    </Button>
  );
}

export default function PlayerSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      age: "",
      country: "",
      location: "",
      ranking: "",
      specialization: "",
      bio: "",
      fundingGoals: "",
      videoUrl: "",
      atpProfileUrl: "",
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const signupMutation = useMutation({
    mutationFn: async (data: SignupForm) => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("fullName", data.fullName);
      formData.append("age", data.age);
      formData.append("country", data.country);
      formData.append("location", data.location);
      if (data.ranking) formData.append("ranking", data.ranking);
      formData.append("specialization", data.specialization);
      formData.append("bio", data.bio);
      formData.append("fundingGoals", data.fundingGoals);
      formData.append("videoUrl", data.videoUrl);
      formData.append("atpProfileUrl", data.atpProfileUrl);
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Signup failed");
      }

      return res.json();
    },
    onSuccess: (data) => {
      // Check if verification is required (new flow)
      if (data.requiresVerification) {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
        });
        // Redirect to signup success page with email
        const email = encodeURIComponent(data.player?.email || "");
        setLocation(`/signup-success?email=${email}`);
      } else {
        // Old flow (fallback) - direct login
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        toast({
          title: "Account Created",
          description: "Welcome to GameSetMatch!",
        });
        setLocation("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Signup Failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignupForm) => {
    signupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 py-12">
        <div className="max-w-2xl mx-auto px-6">
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <Card className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-card-foreground mb-2">
                Player Registration
              </h1>
              <p className="text-muted-foreground">
                Create your GameSetMatch profile and start receiving sponsorships
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Photo Upload */}
                <div className="space-y-2">
                  <FormLabel>Profile Photo</FormLabel>
                  <div className="flex items-center gap-4">
                    {photoPreview ? (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Profile preview"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                        <Upload className="h-6 w-6 text-gray-400" />
                        <span className="text-xs text-gray-400 mt-1">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Upload a professional photo (JPG, PNG, max 5MB)
                    </p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Roger Federer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="At least 8 characters"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="25" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country *</FormLabel>
                        <FormControl>
                          <CountrySelect
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City/Location *</FormLabel>
                        <FormControl>
                          <Input placeholder="Basel, Switzerland" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ranking"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Ranking (Optional)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="150" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your current ATP/WTA/ITF ranking
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Court Specialization *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select court type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courtSpecializations.map((spec) => (
                              <SelectItem key={spec} value={spec}>
                                {spec}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Bio with AI Enhance */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>About You *</FormLabel>
                        <AIEnhanceButton
                          text={field.value}
                          type="bio"
                          onEnhanced={(enhanced) => form.setValue("bio", enhanced)}
                        />
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your tennis journey, achievements, and goals... (Write a rough draft and click 'Enhance with AI' to polish it!)"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Funding Goals with AI Enhance */}
                <FormField
                  control={form.control}
                  name="fundingGoals"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Funding Goals *</FormLabel>
                        <AIEnhanceButton
                          text={field.value}
                          type="fundingGoals"
                          onEnhanced={(enhanced) => form.setValue("fundingGoals", enhanced)}
                        />
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="What will you use the sponsorship funds for? (e.g., tournament fees, coaching, travel, equipment)"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Verification Section */}
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Verification</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We verify all players to ensure authenticity. Please provide the
                    following:
                  </p>

                  <FormField
                    control={form.control}
                    name="atpProfileUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ATP/ITF/WTA Profile URL *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://www.atptour.com/en/players/..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Link to your official profile on atptour.com, itftennis.com,
                          or wtatennis.com
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Verification Video Link *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://youtube.com/... or https://drive.google.com/..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Link to a short video introducing yourself (YouTube, Google
                          Drive, Dropbox, etc.)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>What happens next?</strong>
                    <br />
                    1. You'll receive an email to verify your email address
                    <br />
                    2. After verification, our team will review your profile
                    <br />
                    3. Once approved, you can connect your Stripe account to receive
                    sponsorships
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending
                    ? "Creating Account..."
                    : "Create Account"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/signin" className="text-primary hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}