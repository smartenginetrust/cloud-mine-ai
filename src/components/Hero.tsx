import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import { AuthDialog } from "./AuthDialog";

const Hero = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(15, 18, 30, 0.9), rgba(15, 18, 30, 0.95)), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      
      <div className="container relative z-10 px-4 py-20 mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm">
          <Zap className="w-4 h-4 text-accent" />
          <span className="text-sm text-muted-foreground">AI-Powered Mining Technology</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
          Mine Cryptocurrency
          <br />
          <span className="gradient-text">With AI Intelligence</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Harness the power of artificial intelligence to maximize your mining efficiency. 
          Our cloud-based platform optimizes returns while you focus on growing your portfolio.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="hero" 
            size="lg" 
            className="min-w-[200px]"
            onClick={() => setAuthDialogOpen(true)}
          >
            Start Mining Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button variant="outline" size="lg" className="min-w-[200px]">
            Learn More
          </Button>
        </div>

        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">50K+</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">$2.5B</div>
            <div className="text-sm text-muted-foreground">Mined Value</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">150+</div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
