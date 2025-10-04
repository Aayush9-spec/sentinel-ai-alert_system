import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Feedback } from "@/types/feedback";
import { AlertTriangle, TrendingUp, MessageSquare, Smile } from "lucide-react";

interface DashboardStatsProps {
  feedback: Feedback[];
}

export function DashboardStats({ feedback }: DashboardStatsProps) {
  const urgentCount = feedback.filter(f => f.urgency === 'HIGH').length;
  const positiveCount = feedback.filter(f => f.sentiment === 'positive').length;
  const totalCount = feedback.length;
  const positiveRate = totalCount > 0 ? Math.round((positiveCount / totalCount) * 100) : 0;

  const stats = [
    {
      title: "Urgent Issues",
      value: urgentCount,
      icon: AlertTriangle,
      description: "Require immediate attention",
      color: "text-urgent",
      bgColor: "bg-urgent/10",
    },
    {
      title: "Total Feedback",
      value: totalCount,
      icon: MessageSquare,
      description: "All sources combined",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Positive Rate",
      value: `${positiveRate}%`,
      icon: TrendingUp,
      description: "Customer satisfaction",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Happy Customers",
      value: positiveCount,
      icon: Smile,
      description: "Positive sentiment",
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <div className="space-y-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border-border/50 bg-gradient-to-br from-card to-card/80 hover:shadow-[var(--shadow-hover)] transition-all hover:scale-[1.02] hover:border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2.5 rounded-lg backdrop-blur-sm`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color} tracking-tight`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
