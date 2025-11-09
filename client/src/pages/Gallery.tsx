import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Image as ImageIcon, Loader2, Search, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Gallery() {
  const { user, loading: authLoading } = useAuth();
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<any>(null);

  const { data: campaigns, isLoading: campaignsLoading } = trpc.campaign.list.useQuery(undefined, {
    enabled: !!user,
  });

  const campaignId = selectedCampaign === "all" ? undefined : parseInt(selectedCampaign);
  
  const { data: contents, isLoading: contentsLoading } = trpc.content.list.useQuery(
    { campaignId },
    { enabled: !!user }
  );

  // Filter contents by search query
  const filteredContents = contents?.filter((content) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      content.caption?.toLowerCase().includes(query) ||
      content.campaignName?.toLowerCase().includes(query) ||
      JSON.parse(content.keywords || "[]").some((kw: string) => kw.toLowerCase().includes(query))
    );
  });

  const handleImageClick = (content: any) => {
    setSelectedImage(content.mediaUrl);
    setSelectedContent(content);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setSelectedContent(null);
  };

  if (authLoading) {
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
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Gallery</h1>
              <p className="text-gray-600">
                Browse all AI-generated content from your campaigns
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ImageIcon className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                {filteredContents?.length || 0}
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Campaign Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Campaign
              </label>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Campaigns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {campaigns?.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id.toString()}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Content
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by caption or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {(campaignsLoading || contentsLoading) && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        )}

        {/* Empty State */}
        {!contentsLoading && (!filteredContents || filteredContents.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No content found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedCampaign !== "all"
                  ? "Try adjusting your filters"
                  : "Create a campaign to generate content"}
              </p>
              {!searchQuery && selectedCampaign === "all" && (
                <Link href="/dashboard">
                  <Button>Create Campaign</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Gallery Grid */}
        {filteredContents && filteredContents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredContents.map((content) => (
              <Card
                key={content.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleImageClick(content)}
              >
                <div className="aspect-square bg-gray-100 relative">
                  {content.mediaUrl ? (
                    <img
                      src={content.mediaUrl}
                      alt={content.caption || "Generated content"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400?text=Image+Loading";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={content.status} />
                  </div>
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium line-clamp-1">
                    {content.campaignName}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {content.caption}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {JSON.parse(content.keywords || "[]")
                      .slice(0, 3)
                      .map((keyword: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          #{keyword}
                        </span>
                      ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(content.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        <Dialog open={!!selectedImage} onOpenChange={closeModal}>
          <DialogContent className="max-w-4xl">
            {selectedContent && (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={selectedImage || ""}
                    alt={selectedContent.caption || "Content"}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{selectedContent.campaignName}</h3>
                  <p className="text-gray-700 mb-4">{selectedContent.caption}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {JSON.parse(selectedContent.keywords || "[]").map(
                      (keyword: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          #{keyword}
                        </span>
                      )
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Created: {new Date(selectedContent.createdAt).toLocaleString()}</span>
                    <StatusBadge status={selectedContent.status} />
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    ready: { label: "Ready", className: "bg-green-100 text-green-800" },
    generating: { label: "Generating", className: "bg-yellow-100 text-yellow-800" },
    failed: { label: "Failed", className: "bg-red-100 text-red-800" },
  };

  const config = statusConfig[status] || statusConfig.ready;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
