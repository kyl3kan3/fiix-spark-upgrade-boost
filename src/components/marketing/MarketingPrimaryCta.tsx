import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SIGNUP_PATH } from "@/data/signupRoute";

type MarketingPrimaryCtaProps = {
  label?: string;
  className?: string;
};

const MarketingPrimaryCta = ({
  label = "Start free trial",
  className = "",
}: MarketingPrimaryCtaProps) => {
  const navigate = useNavigate();
  return (
    <Button
      size="lg"
      className={`bg-primary text-primary-foreground hover:bg-primary-variant px-8 font-semibold shadow-md ${className}`.trim()}
      onClick={() => navigate(SIGNUP_PATH)}
    >
      {label}
      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
    </Button>
  );
};

export default MarketingPrimaryCta;
