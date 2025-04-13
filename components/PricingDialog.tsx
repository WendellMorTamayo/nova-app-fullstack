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
          <PulsatingButton className="my-4 sm:my-8 md:my-12 w-full flex items-center justify-center bg-purple-1">
            Get Premium
          </PulsatingButton>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[95vw] md:max-w-2xl lg:max-w-4xl bg-black-2 overflow-y-auto max-h-[90vh]">
        <AlertDialogHeader className="justify-start">
          <AlertDialogTitle className="text-xl sm:text-2xl">Choose Your Plan</AlertDialogTitle>
          <AlertDialogDescription>
            Select the plan that best fits your needs.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col items-center w-full">
          <PricingCards />
        </div>
        <AlertDialogFooter className="sm:flex-row gap-2">
          <AlertDialogCancel className="sm:mt-0 w-full sm:w-auto">Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default PricingDialog;
