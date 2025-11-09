import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Info, Loader2, Users, Zap, Rocket, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface AgentLogsProps {
  campaignId: number;
}

export default function AgentLogs({ campaignId }: AgentLogsProps) {
  const [filterAgent, setFilterAgent] = useState<string>("all");

  const { data: logs, isLoading } = trpc.logs.getCampaignLogs.useQuery(
    { campaignId },
    {
      refetchInterval: 3000, // Auto-refresh every 3 seconds
    }
  );

  // Filter logs by agent type
  const filteredLogs = logs?.filter((log) => {
    if (filterAgent === "all") return true;
    return log.agentType === filterAgent;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Agent Activity Logs</CardTitle>
            <CardDescription>Detailed logs from all agents for this campaign</CardDescription>
          </div>
          <div className="w-48">
            <Select value={filterAgent} onValueChange={setFilterAgent}>
              <SelectTrigger>
                <SelectValue placeholder="All Agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="strategist">Strategist</SelectItem>
                <SelectItem value="creator">Creator</SelectItem>
                <SelectItem value="engager">Engager</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!filteredLogs || filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <Info className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No activity logs yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <LogItem key={log.id} log={log} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LogItem({ log }: { log: any }) {
  const agentConfig = {
    strategist: {
      icon: Users,
      name: "Strategist Agent",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    creator: {
      icon: Zap,
      name: "Creator Agent",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    engager: {
      icon: Rocket,
      name: "Engager Agent",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  };

  const levelConfig = {
    info: {
      icon: Info,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    success: {
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
    },
    error: {
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-100",
    },
  };

  const agent = agentConfig[log.agentType as keyof typeof agentConfig];
  const level = levelConfig[log.level as keyof typeof levelConfig];

  const AgentIcon = agent.icon;
  const LevelIcon = level.icon;

  return (
    <div className="flex gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      {/* Agent Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${agent.bgColor} flex items-center justify-center`}>
        <AgentIcon className={`w-5 h-5 ${agent.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${agent.color}`}>{agent.name}</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-sm font-medium text-gray-900">{log.action}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${level.bgColor}`}>
              <LevelIcon className={`w-3 h-3 ${level.color}`} />
              <span className={`text-xs font-medium ${level.color} capitalize`}>{log.level}</span>
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {new Date(log.createdAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
        {log.details && <p className="text-sm text-gray-600 mt-1">{log.details}</p>}
      </div>
    </div>
  );
}
