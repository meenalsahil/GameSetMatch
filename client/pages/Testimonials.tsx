import { Link } from "wouter";
import { ArrowLeft, MessageSquareQuote } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

export default function Testimonials() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero / Content Section */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6">
        
        <div className="max-w-md w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-10 text-center shadow-2xl">
          
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg transform -rotate-6">
            <MessageSquareQuote className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Coming Soon
          </h1>
          
          <p className="text-emerald-50/80 text-lg mb-8 leading-relaxed">
            We're gathering inspiring success stories from our players and sponsors. This page is currently under construction.
          </p>

          <Button 
            asChild 
            size="lg" 
            className="bg-white text-slate-900 hover:bg-emerald-50 font-semibold px-8 py-6 rounded-xl w-full transition-all shadow-lg"
          >
            <Link href="/">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </Button>

        </div>
      </div>
      
      <Footer />
    </div>
  );
}