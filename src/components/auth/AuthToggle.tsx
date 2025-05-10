
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
        className="text-maintenease-600 hover:text-maintenease-800 text-sm font-medium"
      >
        {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
      </button>
    </div>
  );
};

export default AuthToggle;
