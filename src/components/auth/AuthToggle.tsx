
import { AUTH_BUTTON_TEXT, AUTH_COLORS } from "@/constants/authConstants";

interface AuthToggleProps {
  isSignUp: boolean;
  onToggle: () => void;
}

const AuthToggle = ({ isSignUp, onToggle }: AuthToggleProps) => {
  return (
    <div className="text-center mt-4">
      <button
        type="button"
        onClick={onToggle}
        className={`text-${AUTH_COLORS.PRIMARY_TEXT} hover:text-${AUTH_COLORS.PRIMARY_TEXT_HOVER} text-sm font-medium`}
      >
        {isSignUp ? AUTH_BUTTON_TEXT.SIGN_IN_TOGGLE : AUTH_BUTTON_TEXT.SIGN_UP_TOGGLE}
      </button>
    </div>
  );
};

export default AuthToggle;
