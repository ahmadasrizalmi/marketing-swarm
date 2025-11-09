import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon, Loader2, Rocket, Settings, TrendingUp, Users, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [campaignMessage, setCampaignMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: campaigns, isLoading: campaignsLoading, refetch } = trpc.campaign.list.useQuery(undefined, {
    enabled: !!user,
  });

  const createCampaign = trpc.campaign.create.useMutation({
    onSuccess: (data) => {
      toast.success("Campaign created!");
      setCampaignMessage("");
      setIsCreating(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to create campaign");
      setIsCreating(false);
    },
  });

  const handleCreateCampaign = async () => {
    if (!campaignMessage.trim()) {
      toast.error("Please enter a campaign description");
      return;
    }

    setIsCreating(true);
    createCampaign.mutate({ message: campaignMessage });
  };

  if (authLoading || campaignsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🤖 AI Marketing Swarm
              </h1>
              <p className="text-lg text-gray-600">
                Autonomous multi-agent system for digital marketing campaigns
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/gallery">
                <Button variant="outline" className="gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Gallery
                </Button>
              </Link>
              <Link href="/zapier">
                <Button variant="outline" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Zapier
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Rocket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Strategist, Creator, Engager</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaigns?.filter(c => c.status === 'completed').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaigns?.filter(c => c.status !== 'completed' && c.status !== 'failed').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Campaign Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
            <CardDescription>
              Describe your marketing campaign and let our AI agents handle the rest
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="e.g., Run a one-day awareness campaign for our new product"
                value={campaignMessage}
                onChange={(e) => setCampaignMessage(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isCreating}
              />
              <Button
                onClick={handleCreateCampaign}
                disabled={isCreating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Launch Campaign
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Campaigns</h2>
          
          {!campaigns || campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Rocket className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first campaign to see the AI agents in action!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => (
                <Link key={campaign.id} href={`/campaign/${campaign.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <StatusBadge status={campaign.status} />
                      </div>
                      <CardDescription>{campaign.targetAudience}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{campaign.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium">
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    planning: { label: "Planning", className: "bg-blue-100 text-blue-800" },
    creating: { label: "Creating", className: "bg-yellow-100 text-yellow-800" },
    publishing: { label: "Publishing", className: "bg-purple-100 text-purple-800" },
    completed: { label: "Completed", className: "bg-green-100 text-green-800" },
    failed: { label: "Failed", className: "bg-red-100 text-red-800" },
  };

  const config = statusConfig[status] || statusConfig.planning;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
