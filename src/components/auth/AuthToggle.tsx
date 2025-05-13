
interface AuthToggleProps {
  isSignUp: boolean;
  onToggle: () => void;
}

const AuthToggle = ({ isSignUp, onToggle }: AuthToggleProps) => {
  return (
    <div className="text-center mt-8 animate-fade-in transition-all duration-300">
      <button
        type="button"
        onClick={onToggle}
        className="text-[#9b87f5] hover:text-[#7e6ad4] text-base font-semibold transition-colors underline underline-offset-4 hover:scale-105"
        aria-label={isSignUp ? "Switch to sign in" : "Switch to sign up"}
      >
        {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
      </button>
    </div>
  );
};

export default AuthToggle;
