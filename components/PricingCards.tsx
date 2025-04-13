import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, InfoIcon, FlameIcon, CalendarIcon } from "lucide-react";
import { useAction, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useIsSubscribed } from "@/hooks/useIsSubscribed";


interface Feature {
  name: string;
  hasInfoIcon?: boolean;
}

interface PricingCardProps {
  title: string;
  description: string;
  price: number;
  features: Feature[];
  popular?: boolean;
  cta: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  description,
  price,
  features,
  popular,
  cta,
  onClick,
}) => (
  <Card
    className={`w-full ${popular ? "border-4 border-orange-200 bg-gradient-to-br from-purple-1 via-purple-600 to-purple-800" : "bg-gray-800"}`}
    data-testid="pricing-card"
  >
    <CardHeader>
      {popular && (
        <Badge
          variant="secondary"
          className="absolute top-2 right-2 bg-red-400 text-white"
        >
          POPULAR
        </Badge>
      )}
      <CardTitle className="text-xl sm:text-2xl font-bold">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center mb-4">
        <span className="text-3xl sm:text-4xl font-bold">${price}</span>
        <span className="text-sm text-muted-foreground">/month</span>
      </div>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <CheckIcon className="flex-shrink-0 w-4 h-4 mr-2 text-green-500" />
            <span className="text-sm">{feature.name}</span>
            {feature.hasInfoIcon && (
              <InfoIcon className="flex-shrink-0 w-4 h-4 ml-1 text-orange-300" />
            )}
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button className="w-full" onClick={onClick}>
        {cta}
      </Button>
    </CardFooter>
  </Card>
);

function PricingCards(){
  const pay = useAction(api.stripe.pay);
  const router = useRouter();
  const userData = useQuery(api.users.getUser);
  const isSubscribed = useIsSubscribed();
  
  // Format subscription end date if user is subscribed
  const subscriptionEndDate = userData?.endsOn && isSubscribed
    ? new Date(userData.endsOn).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  async function handleUpgradeClick() {
    // If user is already subscribed, show them their subscription page or settings
    if (isSubscribed) {
      router.push("/settings/subscription");
      return;
    }
    
    // Otherwise proceed with payment flow
    try {
      const url = await pay();
      if (typeof url === 'string') {
        router.push(url);
      } else if (url && 'error' in url) {
        console.error("Payment error:", url.message);
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
    }
  }
  
  // Add subscription info to premium features if user is subscribed
  const premiumFeatures = [
    { name: "All Basic Features" },
    { name: "AI Podcast Creation" },
    { name: "High-Quality Audio" },
    { name: "Priority Support" },
    { name: "Exclusive Content" },
    { name: "Ad-Free Experience" },
  ];
  
  if (isSubscribed && subscriptionEndDate) {
    premiumFeatures.push({ 
      name: `Subscribed until ${subscriptionEndDate}`,
      hasInfoIcon: true
    });
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 p-4 md:p-8 bg-black-2" data-testid="pricing-container">
      <div className="w-full max-w-md mx-auto">
        <PricingCard
          title="Basic"
          description="Enjoy unlimited news podcasts"
          price={0} // Free plan price
          features={[
            { name: "Unlimited Podcasts" },
            { name: "Basic Support" },
            { name: "Standard Audio Quality" },
            { name: "Playlists" },
          ]}
          cta="Current Plan"
          onClick={() => {}}
        />
      </div>
      <div className="relative w-full max-w-md mx-auto">
        <FlameIcon className="w-12 h-12 absolute -top-6 -left-6 text-red-400 hidden md:block" />
        <PricingCard
          title="Premium"
          description="Create and customize podcasts with AI"
          price={4} // Premium plan price
          features={premiumFeatures}
          popular={true}
          cta={isSubscribed ? "Manage Subscription" : "Upgrade Now"}
          onClick={handleUpgradeClick}
        />
        {isSubscribed && (
          <Badge 
            className="absolute top-2 right-2 bg-green-600 text-white"
            variant="default"
          >
            CURRENT PLAN
          </Badge>
        )}
      </div>
    </div>
  );  
}

export default PricingCards;