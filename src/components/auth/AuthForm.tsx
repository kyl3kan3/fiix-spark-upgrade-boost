
import { SignInForm } from "./forms/SignInForm";
import { SignUpForm } from "./forms/SignUpForm";

interface AuthFormProps {
  isSignUp: boolean;
  onSuccess: (email: string) => void;
  onError: (message: string) => void;
}

const AuthForm = ({ isSignUp, onSuccess, onError }: AuthFormProps) => {
  const handleSuccess = (email: string) => {
    localStorage.setItem("last_email", email);
    onSuccess(email);
  };

  const handleError = (message: string) => {
    onError(message);
  };

  return (
    <div className="mt-8">
      {isSignUp ? (
        <SignUpForm onSuccess={handleSuccess} onError={handleError} />
      ) : (
        <SignInForm onSuccess={handleSuccess} onError={handleError} />
      )}
    </div>
  );
};

export default AuthForm;
