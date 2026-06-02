
import { AUTH_BUTTON_TEXT } from "@/constants/authConstants";

interface AuthToggleProps {
  isSignUp: boolean;
  onToggle: () => void;
}

const AuthToggle = ({ isSignUp, onToggle }: AuthToggleProps) => {
  return (
    <div className="text-center mt-2">
      <button
        type="button"
        onClick={onToggle}
        className="text-sm text-primary hover:underline font-medium transition-colors"
      >
        {isSignUp ? AUTH_BUTTON_TEXT.SIGN_IN_TOGGLE : AUTH_BUTTON_TEXT.SIGN_UP_TOGGLE}
      </button>
    </div>
  );
};

export default AuthToggle;
