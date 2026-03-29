import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, TrendingUp, CreditCard } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-purple-100 text-purple-600",
  "bg-orange-100 text-orange-600",
  "bg-teal-100 text-teal-600",
];

function timeAgo(ts: string | null | undefined): string {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 30000,
  });

  const statCards = [
    {
      label: "Total Requests",
      value: stats?.totalRequests ?? "—",
      sub: `${stats?.pendingPayments ?? 0} pending payments`,
      icon: Users,
    },
    {
      label: "Active Courses",
      value: stats?.activeCourses ?? "—",
      sub: `${stats?.draftCourses ?? 0} drafts pending`,
      icon: BookOpen,
    },
    {
      label: "Pending Payments",
      value: stats?.pendingPayments ?? "—",
      sub: "awaiting verification",
      icon: CreditCard,
    },
    {
      label: "Revenue (OMR)",
      value: stats?.totalRevenue ?? "—",
      sub: "from approved payments",
      icon: TrendingUp,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-2">
        <h2 className="text-3xl font-serif font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your platform's performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <span className="text-muted-foreground text-lg animate-pulse">—</span>
                ) : (
                  card.value
                )}
              </div>
              <p className="text-xs text-muted-foreground">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weekly Activity (last 7 days)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Loading…
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.weeklyData ?? []}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar
                      dataKey="requests"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-muted-foreground text-sm">Loading…</div>
            ) : !stats?.recentActivity?.length ? (
              <div className="text-muted-foreground text-sm">No recent activity yet.</div>
            ) : (
              <div className="space-y-6">
                {stats.recentActivity.map((item: any, i: number) => (
                  <div key={i} className="flex items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                    >
                      {item.initials || "?"}
                    </div>
                    <div className="ml-2 space-y-0.5 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.sub} • {timeAgo(item.time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
