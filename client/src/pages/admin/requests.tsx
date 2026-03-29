import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Filter, Eye, MessageSquare, Calendar, DollarSign, Users, Building2, Send, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { WorkshopRequest, ConsultationBooking, WorkshopNote } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const STATUSES = [
  { value: "new", label: "New", color: "bg-blue-100 text-blue-700" },
  { value: "contacted", label: "Contacted", color: "bg-purple-100 text-purple-700" },
  { value: "proposal-sent", label: "Proposal Sent", color: "bg-amber-100 text-amber-700" },
  { value: "negotiating", label: "Negotiating", color: "bg-orange-100 text-orange-700" },
  { value: "confirmed", label: "Confirmed", color: "bg-green-100 text-green-700" },
  { value: "completed", label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
];

export default function AdminRequests() {
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopRequest | null>(null);
  const [newNote, setNewNote] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workshopRequests = [] } = useQuery<WorkshopRequest[]>({
    queryKey: ["/api/workshop-requests"],
    queryFn: async () => {
      const response = await fetch("/api/workshop-requests");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  const { data: consultations = [] } = useQuery<ConsultationBooking[]>({
    queryKey: ["/api/consultations"],
    queryFn: async () => {
      const response = await fetch("/api/consultations");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  const { data: workshopNotes = [] } = useQuery<WorkshopNote[]>({
    queryKey: ["/api/workshop-notes", selectedWorkshop?.id],
    queryFn: async () => {
      if (!selectedWorkshop?.id) return [];
      const response = await fetch(`/api/workshop-requests/${selectedWorkshop.id}/notes`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!selectedWorkshop?.id,
  });

  const updateWorkshopMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<WorkshopRequest> }) => {
      const response = await fetch(`/api/workshop-requests/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.updates),
      });
      if (!response.ok) throw new Error("Failed to update");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workshop-requests"] });
      toast({ title: "Workshop Updated", description: "Changes saved successfully." });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (data: { workshopId: string; note: string }) => {
      const response = await fetch(`/api/workshop-requests/${data.workshopId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: data.note, author: "Admin" }),
      });
      if (!response.ok) throw new Error("Failed to add note");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workshop-notes", selectedWorkshop?.id] });
      setNewNote("");
      toast({ title: "Note Added", description: "Your note has been saved." });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = STATUSES.find(s => s.value === status) || STATUSES[0];
    return <Badge variant="secondary" className={`${statusConfig.color} hover:${statusConfig.color}`}>{statusConfig.label}</Badge>;
  };

  const pipelineStats = {
    new: workshopRequests.filter(r => r.status === "new").length,
    inProgress: workshopRequests.filter(r => ["contacted", "proposal-sent", "negotiating"].includes(r.status)).length,
    confirmed: workshopRequests.filter(r => r.status === "confirmed").length,
    completed: workshopRequests.filter(r => r.status === "completed").length,
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-serif font-bold tracking-tight">Requests</h2>
          <p className="text-muted-foreground">Manage incoming workshop and consultation inquiries.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Leads</p>
                <p className="text-2xl font-bold">{pipelineStats.new}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{pipelineStats.inProgress}</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-full">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold">{pipelineStats.confirmed}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{pipelineStats.completed}</p>
              </div>
              <div className="p-2 bg-emerald-100 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workshops" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workshops">Workshop Requests ({workshopRequests.length})</TabsTrigger>
          <TabsTrigger value="consultations">Consultations ({consultations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="workshops">
          <Card>
            <CardHeader className="px-6 py-4 border-b">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search workshop requests..." className="pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workshopRequests.map((req) => (
                    <TableRow key={req.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedWorkshop(req)}>
                      <TableCell className="font-medium">{req.organizationName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {req.organizationType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>{req.contactName}</div>
                        <div className="text-sm text-muted-foreground">{req.email}</div>
                      </TableCell>
                      <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedWorkshop(req); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultations">
          <Card>
            <CardHeader className="px-6 py-4 border-b">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search consultations..." className="pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Session Type</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultations.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.firstName} {booking.lastName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {booking.sessionType}
                        </Badge>
                      </TableCell>
                      <TableCell>{booking.date} at {booking.time}</TableCell>
                      <TableCell>{booking.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            booking.status === "confirmed" ? "bg-green-100 text-green-700 hover:bg-green-100" :
                            booking.status === "pending" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" :
                            "bg-red-100 text-red-700 hover:bg-red-100"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={!!selectedWorkshop} onOpenChange={(open) => !open && setSelectedWorkshop(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedWorkshop && (
            <>
              <SheetHeader>
                <SheetTitle className="font-serif">{selectedWorkshop.organizationName}</SheetTitle>
                <SheetDescription>Workshop request details and notes</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Organization Type</Label>
                    <p className="font-medium">{selectedWorkshop.organizationType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Contact Person</Label>
                    <p className="font-medium">{selectedWorkshop.contactName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Email</Label>
                    <p className="font-medium">{selectedWorkshop.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Phone</Label>
                    <p className="font-medium">{selectedWorkshop.phone || "-"}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs">Message</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedWorkshop.message}</p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Pipeline Management
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select 
                        value={selectedWorkshop.status} 
                        onValueChange={(value) => updateWorkshopMutation.mutate({ id: selectedWorkshop.id, updates: { status: value } })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(status => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Quoted Price</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="number" 
                          className="pl-8"
                          placeholder="Enter amount"
                          defaultValue={selectedWorkshop.quotedPrice || ""}
                          onBlur={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : null;
                            if (value !== selectedWorkshop.quotedPrice) {
                              updateWorkshopMutation.mutate({ id: selectedWorkshop.id, updates: { quotedPrice: value } });
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Scheduled Date</Label>
                      <Input 
                        type="date" 
                        defaultValue={selectedWorkshop.scheduledDate || ""}
                        onChange={(e) => updateWorkshopMutation.mutate({ id: selectedWorkshop.id, updates: { scheduledDate: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Attendees Count</Label>
                      <div className="relative">
                        <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="number" 
                          className="pl-8"
                          placeholder="Number of attendees"
                          defaultValue={selectedWorkshop.attendeesCount || ""}
                          onBlur={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : null;
                            if (value !== selectedWorkshop.attendeesCount) {
                              updateWorkshopMutation.mutate({ id: selectedWorkshop.id, updates: { attendeesCount: value } });
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Notes ({workshopNotes.length})
                  </h4>
                  
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {workshopNotes.map((note) => (
                      <div key={note.id} className="p-3 bg-muted rounded-md">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm">{note.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{note.note}</p>
                      </div>
                    ))}
                    {workshopNotes.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Textarea 
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1"
                      rows={2}
                    />
                    <Button 
                      size="icon"
                      disabled={!newNote.trim() || addNoteMutation.isPending}
                      onClick={() => addNoteMutation.mutate({ workshopId: selectedWorkshop.id, note: newNote })}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
