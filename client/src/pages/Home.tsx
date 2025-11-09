import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Rocket, Users, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white mb-12">
          <h1 className="text-6xl font-bold mb-4">🤖 AI Marketing Swarm</h1>
          <p className="text-2xl mb-8 opacity-90">
            Autonomous Multi-Agent System for Digital Marketing
          </p>
          <p className="text-lg mb-12 max-w-2xl mx-auto opacity-80">
            Let our AI agents handle your marketing campaigns from planning to execution.
            Three specialized agents work together to create and publish engaging content.
          </p>
          
          {isAuthenticated ? (
            <div className="space-x-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  <Rocket className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={logout}
                className="border-white text-white hover:bg-white/10"
              >
                Logout
              </Button>
            </div>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                Get Started
              </Button>
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
            <Users className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-bold mb-2">Strategist Agent</h3>
            <p className="opacity-90">
              Analyzes your requirements and creates comprehensive campaign plans
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
            <Zap className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-bold mb-2">Creator Agent</h3>
            <p className="opacity-90">
              Generates high-quality visual content using AI image generation
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
            <Rocket className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-bold mb-2">Engager Agent</h3>
            <p className="opacity-90">
              Publishes content to social platforms and manages posting schedules
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
