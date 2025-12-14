import { useState, useMemo, useEffect, useRef } from "react";
import { ArrowLeft, Upload, Check, ChevronsUpDown, Sparkles, Loader2, Search, UserCheck } from "lucide-react";
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
  gender: z.enum(["male", "female"]).optional(),
  playStyle: z.enum(["singles", "doubles", "both"]).optional(),
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

const countries = [
  "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "China", "Croatia", 
  "Czech Republic", "Denmark", "France", "Germany", "Greece", "India", "Italy", "Japan", 
  "Mexico", "Netherlands", "Poland", "Russia", "Serbia", "Spain", "Sweden", "Switzerland", 
  "United Kingdom", "United States", "Other"
];

function CountrySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    const query = searchQuery.toLowerCase();
    return countries.filter(country => country.toLowerCase().includes(query));
  }, [searchQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal">
          {value || "Select country..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-2 border-b">
          <Input placeholder="Search countries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-8" autoFocus />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredCountries.map((country) => (
            <div key={country} className={cn("flex items-center px-3 py-2 cursor-pointer hover:bg-accent", value === country && "bg-accent")} onClick={() => { onChange(country); setOpen(false); setSearchQuery(""); }}>
              <Check className={cn("mr-2 h-4 w-4", value === country ? "opacity-100" : "opacity-0")} />
              {country}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// NEW: Player Lookup Component
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
          <h3 className="font-semibold text-lg text-purple-900 mb-1">Claim your Profile</h3>
          <p className="text-sm text-purple-700 mb-4">Start typing your name to auto-fill your details (Name, Age, Country) from our player database.</p>
          
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

          {results.length > 0 && (
            <div className="mt-2 bg-white rounded-md border shadow-sm divide-y">
              {results.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-purple-50 text-sm flex justify-between items-center"
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

// AI Enhance Button
function AIEnhanceButton({ text, type, onEnhanced, disabled }: { text: string; type: "bio" | "fundingGoals"; onEnhanced: (enhanced: string) => void; disabled?: boolean }) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();

  const handleEnhance = async () => {
    if (!text || text.trim().length < 10) {
      toast({ title: "Need more content", description: "Please write at least 10 characters before enhancing.", variant: "destructive" });
      return;
    }
    setIsEnhancing(true);
    try {
      const res = await fetch("/api/ai/enhance-bio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, type }) });
      if (!res.ok) throw new Error("Failed to enhance");
      const data = await res.json();
      onEnhanced(data.enhanced);
      toast({ title: "Enhanced!", description: "Your text has been improved by AI." });
    } catch (error: any) {
      toast({ title: "Enhancement failed", description: "Please try again later.", variant: "destructive" });
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleEnhance} disabled={disabled || isEnhancing || !text || text.trim().length < 10} className="gap-1.5 text-purple-600 border-purple-200 hover:bg-purple-50">
      {isEnhancing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Enhance
    </Button>
  );
}

export default function PlayerSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleClaimProfile = (playerData: any) => {
    form.setValue("fullName", playerData.fullName);
    // Only set if valid match in country list, otherwise let user select
    if (countries.includes(playerData.country)) {
       form.setValue("country", playerData.country);
    }
    if (playerData.age) form.setValue("age", playerData.age.toString());
    if (playerData.gender) form.setValue("gender", playerData.gender);
    
    toast({
      title: "Profile Details Found!",
      description: "We've auto-filled your basic details. Please fill in the rest.",
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please select an image under 5MB", variant: "destructive" });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const signupMutation = useMutation({
    mutationFn: async (data: SignupForm) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if ((data as any)[key]) formData.append(key, (data as any)[key]);
      });
      if (photoFile) formData.append("photo", photoFile);

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
        toast({ title: "Account Created!", description: "Please check your email to verify your account." });
        const email = encodeURIComponent(data.player?.email || "");
        setLocation(`/signup-success?email=${email}`);
      } else {
        setLocation("/dashboard");
        toast({ title: "Account Created", description: "Welcome to GameSetMatch!" });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Signup Failed", description: error.message || "Please try again.", variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* 1. CLAIM PROFILE SECTION */}
        <PlayerLookup onSelect={handleClaimProfile} />

        {/* 2. MAIN FORM CARD */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-6 sm:px-8 py-8 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Player Registration</h1>
            <p className="text-emerald-100">Create your GameSetMatch profile and start receiving sponsorships</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => signupMutation.mutate(data))} className="p-6 sm:p-8">
              
              {/* Photo Upload */}
              <div className="mb-8 flex items-center gap-6">
                <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center"><Upload className="w-6 h-6 text-gray-400 mx-auto" /><span className="text-xs text-gray-500 mt-1">Upload</span></div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif" onChange={handlePhotoChange} className="hidden" />
                <div><p className="text-sm text-gray-600">Upload a professional photo</p><p className="text-xs text-gray-400">JPG, PNG, max 5MB</p></div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input placeholder="Roger Federer" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email *</FormLabel><FormControl><Input type="email" placeholder="email@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem className="mb-4"><FormLabel>Password *</FormLabel><FormControl><Input type="password" placeholder="At least 8 characters" {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem><FormLabel>Age *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="country" render={({ field }) => (
                  <FormItem><FormLabel>Country *</FormLabel><FormControl><CountrySelect value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              {/* Play Style & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField control={form.control} name="playStyle" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Play Style</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="singles">Singles</SelectItem><SelectItem value="doubles">Doubles</SelectItem><SelectItem value="both">Both</SelectItem></SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel>Location *</FormLabel><FormControl><Input placeholder="City, Country" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              {/* Ranking & Surface */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField control={form.control} name="ranking" render={({ field }) => (
                  <FormItem><FormLabel>Current Ranking (Optional)</FormLabel><FormControl><Input type="number" placeholder="Enter ranking" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="specialization" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surface *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>{courtSpecializations.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Bio & Goals */}
              <div className="space-y-4 mb-8">
                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between"><FormLabel>About You *</FormLabel><AIEnhanceButton text={field.value} type="bio" onEnhanced={(val) => form.setValue("bio", val)} /></div>
                    <FormControl><Textarea className="min-h-[100px]" placeholder="Tell us your story..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="fundingGoals" render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between"><FormLabel>Funding Goals *</FormLabel><AIEnhanceButton text={field.value} type="fundingGoals" onEnhanced={(val) => form.setValue("fundingGoals", val)} /></div>
                    <FormControl><Textarea className="min-h-[100px]" placeholder="What will you use the funds for?" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Verification Links */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Verification</h3>
                <FormField control={form.control} name="atpProfileUrl" render={({ field }) => (
                  <FormItem><FormLabel>ATP/WTA Profile URL *</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="videoUrl" render={({ field }) => (
                  <FormItem className="mt-4"><FormLabel>Video Link *</FormLabel><FormControl><Input placeholder="YouTube/Drive link" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <Button type="submit" className="w-full mt-6" disabled={signupMutation.isPending}>{signupMutation.isPending ? "Creating Account..." : "Create Account"}</Button>
            </form>
          </Form>
        </div>
      </div>
      <Footer />
    </div>
  );
}