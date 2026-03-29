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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MoreVertical, Pencil, Trash2, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ConsultationAvailability } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface FormData {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const emptyFormData: FormData = {
  dayOfWeek: "0",
  startTime: "09:00",
  endTime: "17:00",
  isActive: true,
};

const daysOfWeek = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

const getDayName = (dayOfWeek: number): string => {
  return daysOfWeek.find(d => d.value === String(dayOfWeek))?.label || "Unknown";
};

export default function AdminConsultationAvailability() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ConsultationAvailability | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const queryClient = useQueryClient();

  const { data: availabilitySlots = [], isLoading } = useQuery<ConsultationAvailability[]>({
    queryKey: ["/api/admin/consultation-availability"],
    queryFn: async () => {
      const response = await fetch("/api/admin/consultation-availability");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/admin/consultation-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: parseInt(data.dayOfWeek),
          startTime: data.startTime,
          endTime: data.endTime,
          isActive: data.isActive,
        }),
      });
      if (!response.ok) throw new Error("Failed to create");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultation-availability"] });
      setIsDialogOpen(false);
      setFormData(emptyFormData);
      toast.success("Availability slot created");
    },
    onError: () => {
      toast.error("Failed to create availability slot");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await fetch(`/api/admin/consultation-availability/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: parseInt(data.dayOfWeek),
          startTime: data.startTime,
          endTime: data.endTime,
          isActive: data.isActive,
        }),
      });
      if (!response.ok) throw new Error("Failed to update");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultation-availability"] });
      setIsDialogOpen(false);
      setEditingSlot(null);
      setFormData(emptyFormData);
      toast.success("Availability slot updated");
    },
    onError: () => {
      toast.error("Failed to update availability slot");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/consultation-availability/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultation-availability"] });
      toast.success("Availability slot deleted");
    },
    onError: () => {
      toast.error("Failed to delete availability slot");
    },
  });

  useEffect(() => {
    if (editingSlot) {
      setFormData({
        dayOfWeek: String(editingSlot.dayOfWeek),
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
        isActive: editingSlot.isActive,
      });
    } else {
      setFormData(emptyFormData);
    }
  }, [editingSlot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlot) {
      updateMutation.mutate({ id: editingSlot.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (slot: ConsultationAvailability) => {
    setEditingSlot(slot);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this availability slot?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenDialog = () => {
    setEditingSlot(null);
    setFormData(emptyFormData);
    setIsDialogOpen(true);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Consultation Availability</h1>
            <p className="text-muted-foreground">
              Manage available days and time slots for consultations
            </p>
          </div>
          <Button onClick={handleOpenDialog} data-testid="button-add-slot">
            <Plus className="w-4 h-4 mr-2" />
            Add Time Slot
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Time Slots</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : availabilitySlots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No availability slots configured. Add your first one.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availabilitySlots.map((slot) => (
                    <TableRow key={slot.id} data-testid={`row-slot-${slot.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{getDayName(slot.dayOfWeek)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{slot.startTime}</TableCell>
                      <TableCell>{slot.endTime}</TableCell>
                      <TableCell>
                        <Badge variant={slot.isActive ? "default" : "secondary"}>
                          {slot.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-menu-${slot.id}`}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(slot)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(slot.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSlot ? "Edit Availability Slot" : "Add Availability Slot"}
              </DialogTitle>
              <DialogDescription>
                Configure when consultations are available
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select
                  value={formData.dayOfWeek}
                  onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
                >
                  <SelectTrigger data-testid="select-day">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    data-testid="input-start-time"
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    data-testid="input-end-time"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  data-testid="switch-active"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} data-testid="button-submit">
                  {isPending ? "Saving..." : editingSlot ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
