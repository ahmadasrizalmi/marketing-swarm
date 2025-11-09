import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ExternalLink, Loader2, Plus, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function ZapierSettings() {
  const { user, loading: authLoading } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [platform, setPlatform] = useState<string>("instagram");
  const [webhookUrl, setWebhookUrl] = useState("");

  const { data: webhooks, isLoading, refetch } = trpc.zapier.list.useQuery(undefined, {
    enabled: !!user,
  });

  const createMutation = trpc.zapier.create.useMutation({
    onSuccess: () => {
      toast.success("Webhook added successfully!");
      setIsAddDialogOpen(false);
      setPlatform("instagram");
      setWebhookUrl("");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to add webhook: ${error.message}`);
    },
  });

  const deleteMutation = trpc.zapier.delete.useMutation({
    onSuccess: () => {
      toast.success("Webhook deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete webhook: ${error.message}`);
    },
  });

  const toggleMutation = trpc.zapier.toggle.useMutation({
    onSuccess: () => {
      toast.success("Webhook status updated!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update webhook: ${error.message}`);
    },
  });

  const handleAddWebhook = () => {
    if (!webhookUrl.trim()) {
      toast.error("Please enter a webhook URL");
      return;
    }
    createMutation.mutate({ platform, webhookUrl: webhookUrl.trim() });
  };

  const handleDeleteWebhook = (id: number) => {
    if (confirm("Are you sure you want to delete this webhook?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleToggleWebhook = (id: number, currentStatus: number) => {
    toggleMutation.mutate({ id, isActive: currentStatus === 1 ? 0 : 1 });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const platformIcons: Record<string, string> = {
    instagram: "📷",
    tiktok: "🎵",
    facebook: "📘",
    twitter: "🐦",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="container py-8 max-w-4xl">
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Zap className="w-8 h-8 text-orange-500" />
                Zapier Integration
              </h1>
              <p className="text-gray-600">
                Connect your campaigns to Instagram, TikTok, Facebook, and more via Zapier
              </p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Webhook
            </Button>
          </div>
        </div>

        {/* Setup Instructions */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">How to Set Up Zapier Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600">1.</span>
              <p>
                Go to{" "}
                <a
                  href="https://zapier.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  Zapier.com
                  <ExternalLink className="w-3 h-3" />
                </a>{" "}
                and create a new Zap
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600">2.</span>
              <p>
                Choose <strong>"Webhooks by Zapier"</strong> as the trigger app, select{" "}
                <strong>"Catch Hook"</strong>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600">3.</span>
              <p>
                Copy the webhook URL provided by Zapier and paste it below when adding a new
                webhook
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600">4.</span>
              <p>
                Choose your action app (Instagram, TikTok, Facebook, etc.) and map the fields:
                <br />
                <code className="bg-white px-2 py-1 rounded text-xs mt-1 inline-block">
                  imageUrl, caption, keywords, campaignName
                </code>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600">5.</span>
              <p>Test your Zap and turn it on. Your campaigns will now auto-post!</p>
            </div>
          </CardContent>
        </Card>

        {/* Webhooks List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Webhooks</CardTitle>
            <CardDescription>
              Manage your Zapier webhook connections for multi-platform posting
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : !webhooks || webhooks.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">No webhooks configured yet</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Webhook
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {webhooks.map((webhook) => (
                  <div
                    key={webhook.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl">
                        {platformIcons[webhook.platform] || "🔗"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold capitalize">{webhook.platform}</h3>
                          {webhook.isActive === 1 ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{webhook.webhookUrl}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`toggle-${webhook.id}`} className="text-sm">
                          {webhook.isActive === 1 ? "On" : "Off"}
                        </Label>
                        <Switch
                          id={`toggle-${webhook.id}`}
                          checked={webhook.isActive === 1}
                          onCheckedChange={() =>
                            handleToggleWebhook(webhook.id, webhook.isActive)
                          }
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Webhook Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Zapier Webhook</DialogTitle>
              <DialogDescription>
                Connect a new platform by adding your Zapier webhook URL
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger id="platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">📷 Instagram</SelectItem>
                    <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                    <SelectItem value="facebook">📘 Facebook</SelectItem>
                    <SelectItem value="twitter">🐦 Twitter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Get this URL from your Zapier "Catch Hook" trigger
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddWebhook} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
