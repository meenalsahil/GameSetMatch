import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AdminSeed() {
  const [data, setData] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    if (!data) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seed-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gender, csvData: data }),
      });
      const result = await res.json();
      
      if (res.ok) {
        toast({ title: "Success", description: result.message });
        setData(""); // Clear on success
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to connect to server", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Database Seeder</h1>
      <p className="text-gray-500 mb-6">
        Paste the raw content from your "Mens Ranking" or "Womens Ranking" files here.
        It should look like: "1","Name","USA","1999-01-01"
      </p>

      <Card className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select List Type</label>
          <Select value={gender} onValueChange={(v: any) => setGender(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Men's Ranking (ATP)</SelectItem>
              <SelectItem value="Female">Women's Ranking (WTA)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Paste Data Here</label>
          <Textarea 
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="h-64 font-mono text-xs"
            placeholder={'"1","Player Name","USA","1998-05-05"\n"2","Another Player","ESP","2001-02-01"'}
          />
        </div>

        <Button onClick={handleSeed} disabled={loading || !data} className="w-full">
          {loading ? "Processing..." : "Seed Database"}
        </Button>
      </Card>
    </div>
  );
}