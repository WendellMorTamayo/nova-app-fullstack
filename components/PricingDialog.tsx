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
import { useIsSubscribed } from "@/hooks/useIsSubscribed";
import PulsatingButton from "./ui/pulsating-button";
import PaymentUI from "./PaymentUI";

function PricingDialog() {
  const isSubscribed = useIsSubscribed();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {!isSubscribed && (
          <PulsatingButton 
            className="w-full md:w-[90%] mx-auto py-2.5 flex items-center justify-center font-medium text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-700/20"
            pulseColor="rgba(139, 92, 246, 0.5)"
            duration="2s"
          >
            Get Premium
          </PulsatingButton>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[95vw] md:max-w-2xl lg:max-w-4xl bg-black/90 backdrop-blur-md border-white/10 overflow-y-auto max-h-[90vh]">
        <AlertDialogHeader className="justify-start">
          <AlertDialogTitle className="text-xl sm:text-2xl bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
            Premium Subscription
          </AlertDialogTitle>
          <AlertDialogDescription>
            Unlock AI podcast creation and premium features
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Premium Benefits
            </h3>
            
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded-full mr-2 mt-0.5">
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>AI Podcast Creation</span>
              </li>
              <li className="flex items-start">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded-full mr-2 mt-0.5">
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>High-Quality Audio</span>
              </li>
              <li className="flex items-start">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded-full mr-2 mt-0.5">
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Priority Support</span>
              </li>
              <li className="flex items-start">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded-full mr-2 mt-0.5">
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Exclusive Content</span>
              </li>
              <li className="flex items-start">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded-full mr-2 mt-0.5">
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Ad-Free Experience</span>
              </li>
            </ul>
          </div>
          
          <PaymentUI />
        </div>
        
        <AlertDialogFooter className="sm:flex-row gap-2">
          <AlertDialogCancel className="sm:mt-0 w-full sm:w-auto border border-white/10 bg-black/40 hover:bg-black/60">
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default PricingDialog;
