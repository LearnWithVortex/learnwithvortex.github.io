
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-5xl font-bold mb-6 text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>
        VORTEX GAMES
      </h1>
      <p className="text-xl text-gray-300 mb-8 text-center max-w-2xl">
        Welcome to the next generation gaming platform. Access your games through our redesigned interface.
      </p>
      
      <div className="space-y-4 w-full max-w-md">
        <Button asChild className="w-full h-12 bg-indigo-600 hover:bg-indigo-700">
          <a href="/index.html" className="text-lg">
            Launch Classic Interface
          </a>
        </Button>
        
        <Button asChild variant="outline" className="w-full h-12 border-indigo-400 text-indigo-400 hover:bg-indigo-950">
          <Link to="/react-version" className="text-lg">
            Try New React Version (Coming Soon)
          </Link>
        </Button>
      </div>
      
      <div className="mt-12 text-sm text-gray-400">
        © 2025 Vortex - Enhanced with Lovable AI
      </div>
    </div>
  );
};

export default Index;
