import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import PricingCards from "./PricingCards";
import { useIsSubscribed } from "@/hooks/useIsSubscribed";
import PulsatingButton from "./ui/pulsating-button";

function PricingDialog() {
  const isSubscribed = useIsSubscribed();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {!isSubscribed && (
          <PulsatingButton className="my-12 mr-8 w-full flex items-center justify-center bg-purple-1">
            Get Premium
          </PulsatingButton>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-4xl bg-black-2">
        <AlertDialogHeader className="justify-start">
          <AlertDialogTitle>Choose Your Plan</AlertDialogTitle>
          <AlertDialogDescription>
            Select the plan that best fits your needs.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col items-center w-full">
          <PricingCards />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default PricingDialog;
