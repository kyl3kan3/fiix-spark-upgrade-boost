
import { Loader2 } from "lucide-react";

interface AuthLoaderProps {
  title: string;
  message: string;
}

const AuthLoader = ({ title, message }: AuthLoaderProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-10 rounded-lg shadow-md text-center">
        <h1 className="text-xl font-semibold mb-4">{title}</h1>
        <Loader2 className="animate-spin h-8 w-8 mx-auto text-maintenease-600" />
        <p className="text-gray-500 mt-4">{message}</p>
      </div>
    </div>
  );
};

export default AuthLoader;
