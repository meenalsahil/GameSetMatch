import { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Sparkles, Loader2, Search, UserCheck, Trash2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// --- COMPONENT: Smart Player Search ---
function PlayerLookup({ onSelect }: { onSelect: (player: any) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await fetch(`/api/players/lookup?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <Card className="p-6 mb-8 border-purple-200 bg-purple-50/50">
      <div className="flex items-start gap-4">
        <div className="bg-purple-100 p-2 rounded-full hidden sm:block">
          <UserCheck className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1">
          {/* UPDATED: Better Wording */}
          <h3 className="font-semibold text-lg text-purple-900 mb-1">Find Your Player Record</h3>
          <p className="text-sm text-purple-700 mb-4">
            If you have an ATP/WTA ranking, search your name to auto-fill your details.
          </p>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your name (e.g. Roger Federer)"
              className="pl-9 bg-white"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {searching && (
              <div className="absolute right-3 top-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
              </div>
            )}
          </div>

          {/* UPDATED: "Not Found" Helper Text */}
          <p className="text-xs text-purple-600 mt-2 ml-1">
            <span className="font-semibold">Note:</span> Don't see your name? No problem! 
            You can skip this and fill out the form manually below.
          </p>

          {results.length > 0 && (
            <div className="mt-2 bg-white rounded-md border shadow-sm divide-y max-h-48 overflow-y-auto">
              {results.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-purple-50 text-sm flex justify-between items-center transition-colors"
                  onClick={() => {
                    onSelect(p);
                    setQuery("");
                    setResults([]);
                  }}
                >
                  <span className="font-medium text-slate-800">{p.fullName}</span>
                  <span className="text-slate-500 text-xs">
                    {p.country} {p.age ? `• Age ${p.age}` : ""}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// --- Country Select Component ---
const COUNTRIES = [
  "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", 
  "Chile", "China", "Colombia", "Croatia", "Czech Republic", "Denmark",
  "Egypt", "Finland", "France", "Germany", "Greece", "Hungary", "India",
  "Ireland", "Israel", "Italy", "Japan", "Mexico", "Netherlands", 
  "New Zealand", "Norway", "Poland", "Portugal", "Romania", "Russia",
  "Serbia", "Slovakia", "South Africa", "South Korea", "Spain", 
  "Sweden", "Switzerland", "Thailand", "Turkey", "Ukraine", 
  "United Kingdom", "United States", "Uruguay", "Venezuela"
];

function CountrySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Select onValueChange={onChange} value={value}>
      <FormControl>
        <SelectTrigger className="rounded-xl py-3">
          <SelectValue placeholder="Select country" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
          {COUNTRIES.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}

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

const playerSignupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(14, "Must be at least 14 years old").max(100),
  gender: z.enum(["male", "female"], { required_error: "Please select your gender" }),
  country: z.string().min(1, "Please select a country"),
  location: z.string().min(2, "Please enter your city/location"),
  ranking: z.string().optional(),
  specialization: z.string().min(1, "Please select court specialization"),
  playStyle: z.enum(["singles", "doubles", "both"], { required_error: "Please select your play style" }),
  bio: z.string().min(50, "Please write at least 50 characters about yourself"),
  fundingGoals: z.string().min(30, "Please describe your funding goals (at least 30 characters)"),
  videoUrl: z.string().url("Please enter a valid URL").or(z.literal("")),
  atpProfileUrl: z.string().url("Please enter a valid ATP/ITF/WTA profile URL")
    .refine((value) => isOfficialTourHost(value), {
      message: "Please enter a link to an official ATP, ITF, or WTA player profile",
    }),
});

type PlayerSignupForm = z.infer<typeof playerSignupSchema>;

export default function PlayerSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEnhancingBio, setIsEnhancingBio] = useState(false);
  const [isEnhancingGoals, setIsEnhancingGoals] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const form = useForm<PlayerSignupForm>({
    resolver: zodResolver(playerSignupSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      age: undefined,
      gender: undefined,
      country: "",
      location: "",
      ranking: "",
      specialization: "",
      playStyle: undefined,
      bio: "",
      fundingGoals: "",
      videoUrl: "",
      atpProfileUrl: "",
    },
  });

  const handleClaimProfile = (playerData: any) => {
    form.setValue("fullName", playerData.fullName);
    if (COUNTRIES.includes(playerData.country)) {
       form.setValue("country", playerData.country);
    }
    if (playerData.age) form.setValue("age", playerData.age);
    if (playerData.gender) form.setValue("gender", playerData.gender);
    
    toast({
      title: "Record Found",
      description: "We've auto-filled your basic details. Please complete the rest of the form.",
    });
  };

  // --- NEW: Handle Clear Form ---
  const handleClearForm = () => {
    if(confirm("Are you sure you want to clear all fields?")) {
      form.reset();
      setPhotoFile(null);
      setPhotoPreview(null);
      toast({ title: "Form Cleared", description: "All fields have been reset." });
    }
  };

  const signupMutation = useMutation({
    mutationFn: async (data: PlayerSignupForm) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      });
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
      if (data.requiresVerification) {
        toast({
          title: "Check your email!",
          description: "We've sent you a verification link. Please verify your email to continue.",
        });
        setLocation("/signin?verify=pending");
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const enhanceWithAI = async (type: "bio" | "fundingGoals") => {
    const text = form.getValues(type);
    if (!text || text.trim().length < 10) {
      toast({
        title: "Write something first",
        description: "Please write at least 10 characters, then click enhance.",
        variant: "destructive",
      });
      return;
    }

    if (type === "bio") setIsEnhancingBio(true);
    else setIsEnhancingGoals(true);

    try {
      const res = await fetch("/api/ai/enhance-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type }),
      });

      if (!res.ok) throw new Error("Enhancement failed");

      const data = await res.json();
      form.setValue(type, data.enhanced);
      toast({
        title: "✨ Enhanced!",
        description: "Your text has been polished by AI.",
      });
    } catch (error) {
      toast({
        title: "Enhancement failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      if (type === "bio") setIsEnhancingBio(false);
      else setIsEnhancingGoals(false);
    }
  };

  const onSubmit = (data: PlayerSignupForm) => {
    signupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* 1. SMART SEARCH SECTION */}
        <PlayerLookup onSelect={handleClaimProfile} />

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-6 sm:px-8 py-8 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Player Registration</h1>
            <p className="text-emerald-100">Create your GameSetMatch profile and start receiving sponsorships</p>
            
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mt-4">
              <Sparkles className="w-4 h-4" />
              AI-powered bio writing • FREE
            </div>
          </div>

          {/* Form Content */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 sm:p-8">
              
              {/* Section 1: Profile Photo & Clear Button */}
              <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    Profile Photo
                  </h2>
                  
                  {/* UPDATED: Clear Button */}
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClearForm}
                    className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset Form
                  </Button>
                </div>

                <div className="flex items-center gap-6">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all overflow-hidden"
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                        <span className="text-xs text-gray-500 mt-1">Upload</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <div>
                    <p className="text-sm text-gray-600">Upload a professional photo</p>
                    <p className="text-xs text-gray-400">JPG, PNG, max 5MB</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Basic Information */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Roger Federer" className="rounded-xl py-3" {...field} />
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
                          <Input type="email" placeholder="your.email@example.com" className="rounded-xl py-3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="At least 8 characters" className="rounded-xl py-3" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Player Details */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Player Details
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="25" 
                            className="rounded-xl py-3"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Gender Field */}
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl py-3">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <CountrySelect value={field.value} onChange={field.onChange} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City/Location *</FormLabel>
                        <FormControl>
                          <Input placeholder="Basel, Switzerland" className="rounded-xl py-3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ranking"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Ranking (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="150" className="rounded-xl py-3" {...field} />
                        </FormControl>
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl py-3">
                              <SelectValue placeholder="Select court type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="All Courts">All Courts</SelectItem>
                            <SelectItem value="Hard Court">Hard Court</SelectItem>
                            <SelectItem value="Clay Court">Clay Court</SelectItem>
                            <SelectItem value="Grass Court">Grass Court</SelectItem>
                            <SelectItem value="Indoor">Indoor</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="playStyle"
                  render={({ field }) => (
                    <FormItem className="md:w-1/3">
                      <FormLabel>Play Style *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl py-3">
                            <SelectValue placeholder="Select play style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="singles">Singles</SelectItem>
                          <SelectItem value="doubles">Doubles</SelectItem>
                          <SelectItem value="both">Both Singles & Doubles</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-400 mt-1">What type of matches do you primarily compete in?</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section 4: Tell Your Story (AI) */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Tell Your Story
                  <span className="ml-2 inline-flex items-center gap-1 bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    AI-Powered
                  </span>
                </h2>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>About You *</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => enhanceWithAI("bio")}
                            disabled={isEnhancingBio}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            {isEnhancingBio ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4 mr-1" />
                            )}
                            Enhance with AI
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your tennis journey, achievements, and goals... (Write a rough draft and click 'Enhance with AI' to polish it!)"
                            className="rounded-xl min-h-[140px] resize-none focus:border-purple-500 focus:ring-purple-500/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fundingGoals"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Funding Goals *</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => enhanceWithAI("fundingGoals")}
                            disabled={isEnhancingGoals}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            {isEnhancingGoals ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4 mr-1" />
                            )}
                            Enhance with AI
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="What will you use the sponsorship funds for? (e.g., tournament fees, coaching, travel, equipment)"
                            className="rounded-xl min-h-[120px] resize-none focus:border-purple-500 focus:ring-purple-500/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section 5: Verification */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  Verification
                </h2>
                <p className="text-sm text-gray-600 mb-4">We verify all players to ensure authenticity. Please provide the following:</p>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="atpProfileUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ATP/ITF/WTA Profile URL *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://www.atptour.com/en/players/..." 
                            className="rounded-xl py-3"
                            {...field} 
                          />
                        </FormControl>
                        <p className="text-xs text-gray-400 mt-1">Link to your official profile on atptour.com, itftennis.com, or wtatennis.com</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Video Link *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://youtube.com/... or https://drive.google.com/..." 
                            className="rounded-xl py-3"
                            {...field} 
                          />
                        </FormControl>
                        <p className="text-xs text-gray-400 mt-1">Link to a short video introducing yourself (YouTube, Google Drive, Dropbox, etc.)</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* What Happens Next */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 mb-8 border border-emerald-100">
                <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                    You'll receive an email to verify your email address
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                    After verification, our team will review your profile
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                    Once approved, you can connect your Stripe account to receive sponsorships
                  </li>
                </ol>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 rounded-xl font-semibold text-lg shadow-lg shadow-emerald-500/30 transition-all"
              >
                {signupMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Sign In Link */}
              <p className="text-center text-gray-600 mt-6">
                Already have an account?{" "}
                <Link href="/signin" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}