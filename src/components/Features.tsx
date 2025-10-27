import { Brain, Shield, TrendingUp, Zap, Clock, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Optimization",
    description: "Machine learning algorithms continuously optimize mining strategies for maximum profitability.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption and multi-layer security protocols protect your assets 24/7.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Analytics",
    description: "Advanced dashboards provide instant insights into your mining performance and earnings.",
  },
  {
    icon: Zap,
    title: "Instant Deployment",
    description: "Start mining in minutes with our one-click deployment and automated setup process.",
  },
  {
    icon: Clock,
    title: "24/7 Operations",
    description: "Our infrastructure ensures your mining operations never stop, maximizing your returns.",
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Distributed data centers worldwide ensure low latency and high availability.",
  },
];

const Features = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="gradient-text">AI Cloud Mining</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cutting-edge technology meets simple usability for unparalleled mining performance
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 bg-card border-border hover:border-primary/50 transition-smooth hover:glow-effect group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-smooth">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
