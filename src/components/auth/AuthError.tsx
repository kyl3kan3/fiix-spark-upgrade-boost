
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface AuthErrorProps {
  message: string | null;
}

const AuthError = ({ message }: AuthErrorProps) => {
  if (!message) return null;
  
  return (
    <Alert variant="destructive">
      <AlertTitle>Authentication Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default AuthError;
