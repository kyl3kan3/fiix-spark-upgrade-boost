
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface AuthErrorProps {
  message: string | null;
}

const AuthError = ({ message }: AuthErrorProps) => {
  return (
    <div
      className={`transition-all duration-500
        ${message ? "max-h-40 opacity-100 mb-4 animate-fade-in" : "max-h-0 opacity-0 mb-0"}
        overflow-hidden`}
      aria-live="assertive"
      aria-atomic="true"
    >
      {message && (
        <Alert variant="destructive" className="shadow-lg animate-fade-in">
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AuthError;
