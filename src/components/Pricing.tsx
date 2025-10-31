import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "99",
    description: "Perfect for beginners exploring cloud mining",
    features: [
      "1 TH/s mining power",
      "Basic AI optimization",
      "Email support",
      "Daily payouts",
      "Standard security",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "299",
    description: "Ideal for serious miners seeking growth",
    features: [
      "5 TH/s mining power",
      "Advanced AI optimization",
      "Priority support",
      "Real-time payouts",
      "Enhanced security",
      "Analytics dashboard",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "999",
    description: "Maximum power for professional operations",
    features: [
      "20 TH/s mining power",
      "Premium AI optimization",
      "24/7 dedicated support",
      "Instant payouts",
      "Maximum security",
      "Advanced analytics",
      "Custom configuration",
      "API access",
    ],
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="gradient-text">Mining Plan</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Flexible plans designed to scale with your mining ambitions
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`p-8 relative overflow-hidden transition-smooth ${
                plan.popular 
                  ? 'border-primary glow-effect-strong scale-105' 
                  : 'border-border hover:border-primary/50 hover:glow-effect'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-semibold rounded-bl-lg">
                  POPULAR
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold gradient-text">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                variant={plan.popular ? "hero" : "outline"} 
                className="w-full"
                size="lg"
              >
                Select Plan
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
