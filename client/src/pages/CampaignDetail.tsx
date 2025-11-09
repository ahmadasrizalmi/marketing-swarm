import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle2, Clock, Image as ImageIcon, Loader2 } from "lucide-react";
import AgentLogs from "@/components/AgentLogs";
import { useRoute, Link } from "wouter";

export default function CampaignDetail() {
  const { user, loading: authLoading } = useAuth();
  const [, params] = useRoute("/campaign/:id");
  const campaignId = params?.id ? parseInt(params.id) : 0;

  const { data, isLoading, refetch } = trpc.campaign.get.useQuery(
    { id: campaignId },
    { 
      enabled: !!user && campaignId > 0,
      refetchInterval: (query) => {
        // Auto-refresh if campaign is still in progress
        const campaignData = query.state.data;
        if (campaignData?.campaign?.status && 
            campaignData.campaign.status !== 'completed' && 
            campaignData.campaign.status !== 'failed') {
          return 3000; // Refresh every 3 seconds
        }
        return false;
      }
    }
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || !data.campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Campaign not found</h2>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { campaign, contents, posts } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {campaign.name}
              </h1>
              <p className="text-gray-600">{campaign.targetAudience}</p>
            </div>
            <StatusBadge status={campaign.status} />
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Created</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contents.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posts Published</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{posts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.duration}</div>
            </CardContent>
          </Card>
        </div>

        {/* Content Gallery */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>
              Visual content created by our AI Creator Agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contents.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Content is being generated...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contents.map((content) => (
                  <Card key={content.id} className="overflow-hidden">
                    <div className="aspect-square bg-gray-100 relative">
                      {content.mediaUrl ? (
                        <img
                          src={content.mediaUrl}
                          alt={content.caption}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Image+Loading';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-700 mb-2">{content.caption}</p>
                      <div className="flex flex-wrap gap-1">
                        {JSON.parse(content.keywords || '[]').map((keyword: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Published Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Published Posts</CardTitle>
            <CardDescription>
              Posts published to Circlo platform by our Engager Agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="text-center py-8">
                {campaign.status === 'completed' ? (
                  <p className="text-gray-600">No posts published yet</p>
                ) : (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Posts are being published...</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => {
                  const content = contents.find(c => c.id === post.contentId);
                  return (
                    <div
                      key={post.id}
                      className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium mb-1">
                          {content?.caption || 'Post published'}
                        </p>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>Scheduled: {post.scheduledTime}</span>
                          <span>
                            Published: {new Date(post.publishedAt).toLocaleString()}
                          </span>
                          {post.postId && (
                            <span className="text-blue-600">ID: {post.postId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Agent Logs */}
        <div className="mt-8">
          <AgentLogs campaignId={campaignId} />
        </div>

        {/* Timeline */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Campaign Timeline</CardTitle>
            <CardDescription>Activity log of agent actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TimelineItem
                time={new Date(campaign.createdAt).toLocaleString()}
                title="Campaign Created"
                description="Strategist Agent analyzed requirements and created campaign plan"
                status="completed"
              />
              
              {contents.length > 0 && (
                <TimelineItem
                  time={new Date(contents[0].createdAt).toLocaleString()}
                  title="Content Generation Started"
                  description={`Creator Agent generated ${contents.length} pieces of content`}
                  status="completed"
                />
              )}
              
              {posts.length > 0 && (
                <TimelineItem
                  time={new Date(posts[0].publishedAt).toLocaleString()}
                  title="Publishing Started"
                  description={`Engager Agent published ${posts.length} posts to Circlo`}
                  status="completed"
                />
              )}
              
              {campaign.status === 'completed' && (
                <TimelineItem
                  time={new Date(campaign.updatedAt).toLocaleString()}
                  title="Campaign Completed"
                  description="All tasks completed successfully"
                  status="completed"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    planning: { label: "Planning", className: "bg-blue-100 text-blue-800" },
    creating: { label: "Creating Content", className: "bg-yellow-100 text-yellow-800" },
    publishing: { label: "Publishing", className: "bg-purple-100 text-purple-800" },
    completed: { label: "Completed", className: "bg-green-100 text-green-800" },
    failed: { label: "Failed", className: "bg-red-100 text-red-800" },
  };

  const config = statusConfig[status] || statusConfig.planning;

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}

function TimelineItem({
  time,
  title,
  description,
  status,
}: {
  time: string;
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full ${
            status === "completed" ? "bg-green-500" : "bg-gray-300"
          }`}
        />
        <div className="w-0.5 h-full bg-gray-200 mt-2" />
      </div>
      <div className="flex-1 pb-8">
        <div className="flex items-start justify-between mb-1">
          <h4 className="font-semibold">{title}</h4>
          <span className="text-sm text-gray-500">{time}</span>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
