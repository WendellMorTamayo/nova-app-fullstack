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
import { CheckIcon, InfoIcon, FlameIcon } from "lucide-react";
import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";


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
    className={`w-[300px] ${popular ? "border-4 border-orange-200 bg-gradient-to-br from-purple-1 via-purple-600 to-purple-800" : "bg-gray-800"}`}
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
      <CardTitle className="text-2xl font-bold">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center mb-4">
        <span className="text-4xl font-bold">${price}</span>
        <span className="text-sm text-muted-foreground">/month</span>
      </div>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <CheckIcon className="w-4 h-4 mr-2 text-green-500" />
            <span className="text-sm">{feature.name}</span>
            {feature.hasInfoIcon && (
              <InfoIcon className="w-4 h-4 ml-1 text-orange-300" />
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

  async function handleUpgradeClick() {
    const url = await pay();
    router.push(url);
  }
  
  return (
    <div className="flex flex-col md:flex-row gap-8 p-8 bg-black-2">
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
        cta="Sign Up"
      />
      <div className="relative">
        <FlameIcon className="w-12 h-12 absolute -top-6 -left-6 text-red-400" />
        <PricingCard
          title="Premium"
          description="Create and customize podcasts with AI"
          price={4} // Premium plan price
          features={[
            { name: "All Basic Features" },
            { name: "AI Podcast Creation" },
            { name: "High-Quality Audio" },
            { name: "Priority Support" },
            { name: "Exclusive Content" },
            { name: "Ad-Free Experience" },
          ]}
          popular={true}
          cta="Upgrade Now"
          onClick={handleUpgradeClick}
        />
      </div>
    </div>
  );  
}

export default PricingCards;