
interface AuthToggleProps {
  isSignUp: boolean;
  onToggle: () => void;
}

const AuthToggle = ({ isSignUp, onToggle }: AuthToggleProps) => {
  return (
    <div className="text-center mt-6 animate-fade-in transition-all duration-300">
      <button
        type="button"
        onClick={onToggle}
        className="text-[#9b87f5] hover:text-[#7e6ad4] text-sm font-medium transition-colors underline underline-offset-4"
        aria-label={isSignUp ? "Switch to sign in" : "Switch to sign up"}
      >
        {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
      </button>
    </div>
  );
};

export default AuthToggle;
