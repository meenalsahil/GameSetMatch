// client/pages/EditProfile.tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Footer from "@/components/Footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const editProfileSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  age: z.number().min(13, "You must be at least 13 years old"),
  country: z.string().min(2, "Please enter your country"),
  location: z.string().min(2, "Please enter your location"),
  ranking: z.string().optional(),
  specialization: z.string().min(2, "Please specify your court specialization"),
  bio: z.string().min(10, "Please tell us about your tennis journey (at least 10 characters)"),
  fundingGoals: z.string().min(10, "Please describe what you're raising funds for (at least 10 characters)"),
  videoUrl: z.string().min(1, "Video link is required"),
  atpProfileUrl: z.string().min(1, "ATP/ITF/WTA Profile URL is required"),
  photo: z.any().optional(),
});

type EditProfileForm = z.infer<typeof editProfileSchema>;

export default function EditProfile() {
  const { player, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullName: "",
      age: 18,
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

  // Pre-fill form with current player data
  useEffect(() => {
    if (player) {
      form.reset({
        fullName: player.fullName || "",
        age: player.age || 18,
        country: player.country || "",
        location: player.location || "",
        ranking: player.ranking?.toString() || "",
        specialization: player.specialization || "",
        bio: player.bio || "",
        fundingGoals: player.fundingGoals || "",
        videoUrl: player.videoUrl || "",
        atpProfileUrl: player.atpProfileUrl || "",
      });
    }
  }, [player, form]);

  const updateMutation = useMutation({
    mutationFn: async (values: EditProfileForm) => {
      const formData = new FormData();

      formData.append("fullName", values.fullName);
      formData.append("age", values.age.toString());
      formData.append("country", values.country);
      formData.append("location", values.location);
      if (values.ranking) formData.append("ranking", values.ranking);
      formData.append("specialization", values.specialization);
      formData.append("bio", values.bio);
      formData.append("fundingGoals", values.fundingGoals);
      formData.append("videoUrl", values.videoUrl);
      formData.append("atpProfileUrl", values.atpProfileUrl);

      if (values.photo) {
        formData.append("photo", values.photo);
      }

      const response = await fetch("/api/players/me", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Update failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile updated successfully",
        description: "Your changes have been saved.",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!player) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="bg-gradient-to-b from-primary/10 to-background py-12">
          <div className="container mx-auto px-6">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="mb-4"
            >
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Edit Profile
            </h1>
            <p className="text-lg text-muted-foreground">
              Update your tennis profile information
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-3xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))} className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-card-foreground mb-6">
                  Personal Information
                </h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Your age"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || undefined)
                            }
                          />
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
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., United States, Spain, Australia"
                            {...field}
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
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, Country" {...field} />
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
                          <Input
                            placeholder="e.g., 234"
                            {...field}
                            value={field.value || ""}
                          />
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
                        <FormLabel>Specialization</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Clay Court, Hard Court, Grass Court"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-bold text-card-foreground mb-6">
                  About You & Verification
                </h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Story</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell sponsors about your tennis journey, goals, and why you need support..."
                            className="min-h-[150px]"
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
                        <FormLabel>What are you raising funds for?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Travel to ATP Challenger series, new equipment, coaching, tournament entry fees..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Video Link</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="Video of you playing tennis or your quick introduction"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          YouTube or Vimeo link for identity verification
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="atpProfileUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ATP/ITF/WTA Profile URL</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://www.atptour.com/en/players/..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Link to your official ATP Tour, ITF Tennis, or WTA profile
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="photo"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Update Profile Photo (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  toast({
                                    title: "File too large",
                                    description: "Profile photo must be less than 5MB",
                                    variant: "destructive",
                                  });
                                  e.target.value = "";
                                  return;
                                }
                                onChange(file);
                              }
                            }}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Upload a new photo (JPG, PNG, GIF - max 5MB) or leave empty to keep current photo
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {player.photoUrl && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Current Photo:</p>
                      <img
                        src={player.photoUrl}
                        alt="Current profile"
                        className="w-32 h-32 rounded-lg object-cover border"
                      />
                    </div>
                  )}
                </div>
              </Card>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/dashboard")}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
