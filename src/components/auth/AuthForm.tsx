
import { SignInForm } from "./forms/SignInForm";
import { SignUpForm } from "./forms/SignUpForm";

interface AuthFormProps {
  isSignUp: boolean;
  onError: (message: string) => void;
}

const AuthForm = ({ isSignUp, onError }: AuthFormProps) => {
  return (
    <div className="mt-8">
      {isSignUp ? (
        <SignUpForm onError={onError} />
      ) : (
        <SignInForm onError={onError} />
      )}
    </div>
  );
};

export default AuthForm;
