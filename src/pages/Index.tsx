
import { useState } from "react";

const Index = () => {
  const [showIframe, setShowIframe] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className={`container ${showIframe ? 'hidden' : 'block'}`} id="errorPage">
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>404</h1>
          <p className="text-xl text-gray-600 mb-8">
            <strong>There isn't a GitHub Pages site here.</strong>
          </p>
          
          <p className="text-base text-gray-500 max-w-lg text-center mb-10">
            If you're trying to publish one, 
            read the full documentation to learn how to set up 
            <strong> GitHub Pages</strong> for your repository, organization, or user account.
          </p>
          
          <div className="space-y-4 w-full max-w-md flex flex-col items-center">
            <button 
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onClick={() => setShowIframe(true)}
              className={`relative px-6 py-2 bg-indigo-600 text-white rounded group transition-all duration-500 ease-in-out transform hover:scale-105 
                ${isHovering ? 'shadow-lg shadow-indigo-500/50' : ''}`}
            >
              <span className="relative z-10">Launch Games</span>
              <div className={`absolute inset-0 bg-indigo-700 rounded transition-all duration-500 ease-in-out 
                ${isHovering ? 'opacity-100 scale-105' : 'opacity-0 scale-95'}`}></div>
            </button>
            
            <div className="text-sm text-gray-500 mt-8 flex gap-4">
              <a href="#" className="hover:text-indigo-600 transition-colors duration-300">GitHub Status</a>
              <span>—</span>
              <a href="#" className="hover:text-indigo-600 transition-colors duration-300">@githubstatus</a>
            </div>
          </div>
        </div>
      </div>
      
      {showIframe && (
        <div className="fixed inset-0 bg-white z-10">
          <iframe 
            src="/g.html" 
            className="w-full h-full border-none"
            title="Games"
          />
          <button 
            onClick={() => setShowIframe(false)}
            className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-full z-20 transition-all duration-300 hover:bg-gray-700 hover:scale-110"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default Index;
