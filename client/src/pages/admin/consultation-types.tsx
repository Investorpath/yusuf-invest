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
import { Plus, MoreVertical, Pencil, Trash2, Video, MapPin, Globe } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ConsultationType } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface FormData {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  bestFor: string;
  bestForAr: string;
  outcome: string;
  outcomeAr: string;
  price: string;
  duration: string;
  color: string;
  availableOnline: boolean;
  availableOffline: boolean;
  status: string;
  orderIndex: string;
}

const emptyFormData: FormData = {
  title: "",
  titleAr: "",
  description: "",
  descriptionAr: "",
  bestFor: "",
  bestForAr: "",
  outcome: "",
  outcomeAr: "",
  price: "",
  duration: "60",
  color: "bg-blue-500",
  availableOnline: true,
  availableOffline: true,
  status: "active",
  orderIndex: "0",
};

const colorOptions = [
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-emerald-500", label: "Green" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-orange-500", label: "Orange" },
  { value: "bg-red-500", label: "Red" },
  { value: "bg-pink-500", label: "Pink" },
  { value: "bg-indigo-500", label: "Indigo" },
  { value: "bg-teal-500", label: "Teal" },
];

export default function AdminConsultationTypes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<ConsultationType | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const queryClient = useQueryClient();

  const { data: consultationTypes = [], isLoading } = useQuery<ConsultationType[]>({
    queryKey: ["/api/admin/consultation-types"],
    queryFn: async () => {
      const response = await fetch("/api/admin/consultation-types");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/admin/consultation-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          titleAr: data.titleAr || null,
          description: data.description || null,
          descriptionAr: data.descriptionAr || null,
          bestFor: data.bestFor || null,
          bestForAr: data.bestForAr || null,
          outcome: data.outcome || null,
          outcomeAr: data.outcomeAr || null,
          price: parseInt(data.price) || 0,
          duration: parseInt(data.duration) || 60,
          color: data.color,
          availableOnline: data.availableOnline,
          availableOffline: data.availableOffline,
          status: data.status,
          orderIndex: parseInt(data.orderIndex) || 0,
        }),
      });
      if (!response.ok) throw new Error("Failed to create");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultation-types"] });
      setIsDialogOpen(false);
      setFormData(emptyFormData);
      toast.success("Consultation type created");
    },
    onError: () => {
      toast.error("Failed to create consultation type");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await fetch(`/api/admin/consultation-types/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          titleAr: data.titleAr || null,
          description: data.description || null,
          descriptionAr: data.descriptionAr || null,
          bestFor: data.bestFor || null,
          bestForAr: data.bestForAr || null,
          outcome: data.outcome || null,
          outcomeAr: data.outcomeAr || null,
          price: parseInt(data.price) || 0,
          duration: parseInt(data.duration) || 60,
          color: data.color,
          availableOnline: data.availableOnline,
          availableOffline: data.availableOffline,
          status: data.status,
          orderIndex: parseInt(data.orderIndex) || 0,
        }),
      });
      if (!response.ok) throw new Error("Failed to update");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultation-types"] });
      setIsDialogOpen(false);
      setEditingType(null);
      setFormData(emptyFormData);
      toast.success("Consultation type updated");
    },
    onError: () => {
      toast.error("Failed to update consultation type");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/consultation-types/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultation-types"] });
      toast.success("Consultation type deleted");
    },
    onError: () => {
      toast.error("Failed to delete consultation type");
    },
  });

  useEffect(() => {
    if (editingType) {
      setFormData({
        title: editingType.title || "",
        titleAr: editingType.titleAr || "",
        description: editingType.description || "",
        descriptionAr: editingType.descriptionAr || "",
        bestFor: editingType.bestFor || "",
        bestForAr: editingType.bestForAr || "",
        outcome: editingType.outcome || "",
        outcomeAr: editingType.outcomeAr || "",
        price: String(editingType.price || ""),
        duration: String(editingType.duration || "60"),
        color: editingType.color || "bg-blue-500",
        availableOnline: editingType.availableOnline ?? true,
        availableOffline: editingType.availableOffline ?? true,
        status: editingType.status || "active",
        orderIndex: String(editingType.orderIndex || "0"),
      });
    } else {
      setFormData(emptyFormData);
    }
  }, [editingType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingType) {
      updateMutation.mutate({ id: editingType.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (type: ConsultationType) => {
    setEditingType(type);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this consultation type?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenDialog = () => {
    setEditingType(null);
    setFormData(emptyFormData);
    setIsDialogOpen(true);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Consultation Types</h1>
            <p className="text-muted-foreground">
              Manage consultation types with online/offline availability
            </p>
          </div>
          <Button onClick={handleOpenDialog} data-testid="button-add-type">
            <Plus className="w-4 h-4 mr-2" />
            Add Type
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Consultation Types</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : consultationTypes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No consultation types yet. Add your first one.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultationTypes.map((type) => (
                    <TableRow key={type.id} data-testid={`row-type-${type.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                          <div>
                            <div className="font-medium">{type.title}</div>
                            {type.titleAr && (
                              <div className="text-sm text-muted-foreground" dir="rtl">
                                {type.titleAr}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{type.price} OMR</span>
                      </TableCell>
                      <TableCell>{type.duration} min</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {type.availableOnline && (
                            <Badge variant="outline" className="gap-1">
                              <Video className="w-3 h-3" />
                              Online
                            </Badge>
                          )}
                          {type.availableOffline && (
                            <Badge variant="outline" className="gap-1">
                              <MapPin className="w-3 h-3" />
                              Offline
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={type.status === "active" ? "default" : "secondary"}>
                          {type.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-menu-${type.id}`}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(type)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(type.id)}
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingType ? "Edit Consultation Type" : "Add Consultation Type"}
                </DialogTitle>
                <DialogDescription>
                  Configure the consultation type details and availability settings.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title (English)</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Financial Clarity Session"
                      required
                      data-testid="input-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (Arabic)</Label>
                    <Input
                      value={formData.titleAr}
                      onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                      placeholder="جلسة الوضوح المالي"
                      dir="rtl"
                      data-testid="input-title-ar"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Description (English)</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of this consultation type..."
                      rows={3}
                      data-testid="input-description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Arabic)</Label>
                    <Textarea
                      value={formData.descriptionAr}
                      onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                      placeholder="وصف موجز لهذا النوع من الاستشارات..."
                      dir="rtl"
                      rows={3}
                      data-testid="input-description-ar"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Best For (English)</Label>
                    <Textarea
                      value={formData.bestFor}
                      onChange={(e) => setFormData({ ...formData, bestFor: e.target.value })}
                      placeholder="Who is this consultation best for? e.g., Young professionals starting their investment journey..."
                      rows={2}
                      data-testid="input-best-for"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Best For (Arabic)</Label>
                    <Textarea
                      value={formData.bestForAr}
                      onChange={(e) => setFormData({ ...formData, bestForAr: e.target.value })}
                      placeholder="لمن هذه الاستشارة مناسبة؟"
                      dir="rtl"
                      rows={2}
                      data-testid="input-best-for-ar"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Outcome (English)</Label>
                    <Textarea
                      value={formData.outcome}
                      onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                      placeholder="What will the client gain? e.g., Clear action plan, personalized investment strategy..."
                      rows={2}
                      data-testid="input-outcome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Outcome (Arabic)</Label>
                    <Textarea
                      value={formData.outcomeAr}
                      onChange={(e) => setFormData({ ...formData, outcomeAr: e.target.value })}
                      placeholder="ماذا سيحصل العميل؟"
                      dir="rtl"
                      rows={2}
                      data-testid="input-outcome-ar"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Price (OMR)</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="150"
                      required
                      data-testid="input-price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="60"
                      required
                      data-testid="input-duration"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={formData.orderIndex}
                      onChange={(e) => setFormData({ ...formData, orderIndex: e.target.value })}
                      placeholder="0"
                      data-testid="input-order"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Select
                      value={formData.color}
                      onValueChange={(v) => setFormData({ ...formData, color: v })}
                    >
                      <SelectTrigger data-testid="select-color">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded ${c.value}`}></div>
                              {c.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Availability Settings
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Online</div>
                          <div className="text-sm text-muted-foreground">Video call sessions</div>
                        </div>
                      </div>
                      <Switch
                        checked={formData.availableOnline}
                        onCheckedChange={(v) => setFormData({ ...formData, availableOnline: v })}
                        data-testid="switch-online"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">In-Person</div>
                          <div className="text-sm text-muted-foreground">Muscat locations</div>
                        </div>
                      </div>
                      <Switch
                        checked={formData.availableOffline}
                        onCheckedChange={(v) => setFormData({ ...formData, availableOffline: v })}
                        data-testid="switch-offline"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} data-testid="button-save">
                  {isPending ? "Saving..." : editingType ? "Save Changes" : "Create Type"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
