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
import { Plus, Search, MoreVertical, Pencil, Trash2, GripVertical, X, ChevronDown, ChevronUp, BookOpen, Eye, EyeOff, FileText, Copy } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Upload, ImageIcon, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Course } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface CurriculumLesson {
  title: string;
  youtubeUrl: string;
}

interface CurriculumSection {
  title: string;
  lessons: CurriculumLesson[];
}

interface CourseFormData {
  title: string;
  category: string;
  level: string;
  price: string;
  lessons: string;
  duration: string;
  description: string;
  instructor: string;
  instructorBio: string;
  objectives: string;
  prerequisites: string;
  status: string;
  image: string;
  curriculum: CurriculumSection[];
}

const emptyFormData: CourseFormData = {
  title: "",
  category: "",
  level: "مبتدئ",
  price: "",
  lessons: "0",
  duration: "",
  description: "",
  instructor: "يوسف أحمد",
  instructorBio: "",
  objectives: "",
  prerequisites: "",
  status: "draft",
  image: "",
  curriculum: [],
};

function SortableLesson({
  id,
  lesson,
  lessonIndex,
  sectionIndex,
  isRtl,
  onUpdate,
  onRemove,
}: {
  id: string;
  lesson: CurriculumLesson;
  lessonIndex: number;
  sectionIndex: number;
  isRtl: boolean;
  onUpdate: (sectionIndex: number, lessonIndex: number, field: keyof CurriculumLesson, value: string) => void;
  onRemove: (sectionIndex: number, lessonIndex: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg p-3 ms-6 space-y-2 bg-muted/30">
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-muted-foreground w-6">{lessonIndex + 1}.</span>
        <Input
          placeholder={isRtl ? "عنوان الدرس" : "Lesson title"}
          value={lesson.title}
          onChange={(e) => onUpdate(sectionIndex, lessonIndex, "title", e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-600"
          onClick={() => onRemove(sectionIndex, lessonIndex)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2 ps-6">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {isRtl ? "رابط YouTube:" : "YouTube URL:"}
        </span>
        <Input
          placeholder="https://youtube.com/watch?v=..."
          value={lesson.youtubeUrl}
          onChange={(e) => onUpdate(sectionIndex, lessonIndex, "youtubeUrl", e.target.value)}
          className="flex-1 text-sm"
          dir="ltr"
        />
      </div>
    </div>
  );
}

function CurriculumBuilder({ 
  sections, 
  onChange, 
  language 
}: { 
  sections: CurriculumSection[]; 
  onChange: (sections: CurriculumSection[]) => void;
  language: "en" | "ar";
}) {
  const isRtl = language === "ar";
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const addSection = () => {
    onChange([...sections, { title: "", lessons: [] }]);
  };

  const updateSectionTitle = (index: number, title: string) => {
    const updated = [...sections];
    updated[index].title = title;
    onChange(updated);
  };

  const removeSection = (index: number) => {
    onChange(sections.filter((_, i) => i !== index));
  };

  const addLesson = (sectionIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].lessons.push({ title: "", youtubeUrl: "" });
    onChange(updated);
  };

  const updateLesson = (sectionIndex: number, lessonIndex: number, field: keyof CurriculumLesson, value: string) => {
    const updated = [...sections];
    updated[sectionIndex].lessons[lessonIndex][field] = value;
    onChange(updated);
  };

  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].lessons = updated[sectionIndex].lessons.filter((_, i) => i !== lessonIndex);
    onChange(updated);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === sections.length - 1)) {
      return;
    }
    const updated = [...sections];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  const handleDragEnd = (sectionIndex: number) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const updated = [...sections];
      const oldIndex = updated[sectionIndex].lessons.findIndex((_, i) => `${sectionIndex}-${i}` === active.id);
      const newIndex = updated[sectionIndex].lessons.findIndex((_, i) => `${sectionIndex}-${i}` === over.id);
      updated[sectionIndex].lessons = arrayMove(updated[sectionIndex].lessons, oldIndex, newIndex);
      onChange(updated);
    }
  };

  return (
    <div className="space-y-4" dir={isRtl ? "rtl" : "ltr"}>
      {sections.map((section, sectionIndex) => (
        <Card key={sectionIndex} className="border-2">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
              <Input
                placeholder={isRtl ? "عنوان القسم" : "Section title"}
                value={section.title}
                onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                className="flex-1 font-medium"
              />
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveSection(sectionIndex, "up")}
                  disabled={sectionIndex === 0}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveSection(sectionIndex, "down")}
                  disabled={sectionIndex === sections.length - 1}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                  onClick={() => removeSection(sectionIndex)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-2 px-4 space-y-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd(sectionIndex)}
            >
              <SortableContext
                items={section.lessons.map((_, i) => `${sectionIndex}-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                {section.lessons.map((lesson, lessonIndex) => (
                  <SortableLesson
                    key={`${sectionIndex}-${lessonIndex}`}
                    id={`${sectionIndex}-${lessonIndex}`}
                    lesson={lesson}
                    lessonIndex={lessonIndex}
                    sectionIndex={sectionIndex}
                    isRtl={isRtl}
                    onUpdate={updateLesson}
                    onRemove={removeLesson}
                  />
                ))}
              </SortableContext>
            </DndContext>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ms-6"
              onClick={() => addLesson(sectionIndex)}
            >
              <Plus className="w-4 h-4 me-1" />
              {isRtl ? "إضافة درس" : "Add Lesson"}
            </Button>
          </CardContent>
        </Card>
      ))}
      
      <Button type="button" variant="outline" onClick={addSection} className="w-full">
        <Plus className="w-4 h-4 me-2" />
        {isRtl ? "إضافة قسم جديد" : "Add New Section"}
      </Button>
    </div>
  );
}

function CourseImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("الرجاء اختيار ملف صورة");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 10 ميجابايت");
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error("يجب تسجيل الدخول أولاً");
        } else if (response.status === 403) {
          throw new Error("غير مصرح لك برفع الصور");
        }
        throw new Error(errorData.error || "Failed to get upload URL");
      }

      const { uploadURL, objectPath } = await response.json();

      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error("فشل رفع الملف إلى التخزين");
      }

      onChange(objectPath);
      toast.success("تم رفع الصورة بنجاح");
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error(error.message || "فشل رفع الصورة");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Course preview"
            className="w-full h-40 object-cover rounded-lg border"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 me-1" />}
              تغيير الصورة
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onChange("")}
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground animate-spin" />
          ) : (
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {isUploading ? "جاري الرفع..." : "اضغط لاختيار صورة"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, WEBP (الحد الأقصى 10 ميجابايت)
          </p>
        </div>
      )}
    </div>
  );
}

function CourseEditor({
  isOpen,
  onClose,
  editingCourse,
  onSave,
  isPending,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingCourse: Course | null;
  onSave: (data: CourseFormData) => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState<CourseFormData>(emptyFormData);
  const [activeTab, setActiveTab] = useState("basic");

  const migrateLegacyCurriculum = (sections: any[]): CurriculumSection[] => {
    return sections.map(section => ({
      title: section.title || "",
      lessons: (section.lessons || []).map((lesson: any) => {
        if (typeof lesson === "string") {
          return { title: lesson, youtubeUrl: "" };
        }
        return { title: lesson.title || "", youtubeUrl: lesson.youtubeUrl || "" };
      })
    }));
  };

  useEffect(() => {
    if (editingCourse) {
      let curriculum: CurriculumSection[] = [];
      
      try {
        const curriculumSource = editingCourse.curriculumAr || editingCourse.curriculum;
        if (curriculumSource) {
          const parsed = JSON.parse(curriculumSource);
          curriculum = migrateLegacyCurriculum(parsed);
        }
      } catch (e) {}

      setFormData({
        title: editingCourse.titleAr || editingCourse.title || "",
        category: editingCourse.categoryAr || editingCourse.category || "",
        level: editingCourse.levelAr || editingCourse.level || "مبتدئ",
        price: String(editingCourse.price || ""),
        lessons: String(editingCourse.lessons || "0"),
        duration: editingCourse.durationAr || editingCourse.duration || "",
        description: editingCourse.descriptionAr || editingCourse.description || "",
        instructor: editingCourse.instructorAr || editingCourse.instructor || "يوسف أحمد",
        instructorBio: editingCourse.instructorBioAr || editingCourse.instructorBio || "",
        objectives: editingCourse.objectivesAr || editingCourse.objectives || "",
        prerequisites: editingCourse.prerequisitesAr || editingCourse.prerequisites || "",
        status: editingCourse.status || "draft",
        image: (editingCourse as any).image || "",
        curriculum,
      });
      setActiveTab("basic");
    } else {
      setFormData(emptyFormData);
      setActiveTab("basic");
    }
  }, [editingCourse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalLessons = formData.curriculum.reduce((acc, section) => acc + section.lessons.length, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? "Edit Course" : "Create New Course"}
            </DialogTitle>
            <DialogDescription>
              {editingCourse 
                ? "Update course details, content, and curriculum." 
                : "Add a new course to your catalog with English and Arabic content."}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">معلومات أساسية</TabsTrigger>
              <TabsTrigger value="content">المحتوى</TabsTrigger>
              <TabsTrigger value="curriculum">المنهج</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4" dir="rtl">
              <div className="space-y-2">
                <Label>عنوان الدورة</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="عنوان الدورة"
                  dir="rtl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>صورة الدورة</Label>
                <CourseImageUpload
                  value={formData.image}
                  onChange={(url) => updateField("image", url)}
                />
              </div>

              <div className="space-y-2">
                <Label>التصنيف</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  placeholder="مثال: التمويل الشخصي"
                  dir="rtl"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>المستوى</Label>
                  <Select value={formData.level} onValueChange={(v) => updateField("level", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="مبتدئ">مبتدئ</SelectItem>
                      <SelectItem value="متوسط">متوسط</SelectItem>
                      <SelectItem value="متقدم">متقدم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>السعر (ر.ع)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    placeholder="49"
                    dir="ltr"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>الحالة</Label>
                  <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="published">منشور</SelectItem>
                      <SelectItem value="archived">مؤرشف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>المدة</Label>
                <Input
                  value={formData.duration}
                  onChange={(e) => updateField("duration", e.target.value)}
                  placeholder="مثال: 4 ساعات و 30 دقيقة"
                  dir="rtl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>اسم المدرب</Label>
                <Input
                  value={formData.instructor}
                  onChange={(e) => updateField("instructor", e.target.value)}
                  placeholder="اسم المدرب"
                  dir="rtl"
                />
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-4" dir="rtl">
              <div className="space-y-2">
                <Label>وصف الدورة</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="وصف الدورة..."
                  dir="rtl"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>نبذة عن المدرب</Label>
                <Textarea
                  value={formData.instructorBio}
                  onChange={(e) => updateField("instructorBio", e.target.value)}
                  placeholder="نبذة عن المدرب..."
                  dir="rtl"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>أهداف التعلم</Label>
                <Textarea
                  value={formData.objectives}
                  onChange={(e) => updateField("objectives", e.target.value)}
                  placeholder="هدف واحد في كل سطر..."
                  dir="rtl"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">أدخل كل هدف في سطر جديد</p>
              </div>

              <div className="space-y-2">
                <Label>المتطلبات المسبقة</Label>
                <Textarea
                  value={formData.prerequisites}
                  onChange={(e) => updateField("prerequisites", e.target.value)}
                  placeholder="متطلب واحد في كل سطر..."
                  dir="rtl"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="curriculum" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">منهج الدورة</h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.curriculum.length} أقسام، {totalLessons} دروس
                    </p>
                  </div>
                </div>
                <CurriculumBuilder
                  sections={formData.curriculum}
                  onChange={(sections) => updateField("curriculum", sections)}
                  language="ar"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : editingCourse ? "Save Changes" : "Create Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminCourses() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "archived">("all");
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const response = await fetch("/api/courses");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      const totalLessons = data.curriculum.reduce((acc, section) => acc + section.lessons.length, 0);
      
      const payload = {
        title: data.title,
        titleAr: data.title,
        category: data.category,
        categoryAr: data.category,
        level: data.level,
        levelAr: data.level,
        price: parseInt(data.price) || 0,
        lessons: totalLessons,
        duration: data.duration,
        durationAr: data.duration,
        description: data.description || null,
        descriptionAr: data.description || null,
        instructor: data.instructor || null,
        instructorAr: data.instructor || null,
        instructorBio: data.instructorBio || null,
        instructorBioAr: data.instructorBio || null,
        objectives: data.objectives || null,
        objectivesAr: data.objectives || null,
        prerequisites: data.prerequisites || null,
        prerequisitesAr: data.prerequisites || null,
        status: data.status,
        curriculum: data.curriculum.length > 0 ? JSON.stringify(data.curriculum) : null,
        curriculumAr: data.curriculum.length > 0 ? JSON.stringify(data.curriculum) : null,
        image: data.image || null,
      };

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to create");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast.success("تم إنشاء الدورة بنجاح");
      setIsDialogOpen(false);
      setEditingCourse(null);
    },
    onError: () => {
      toast.error("فشل في إنشاء الدورة");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CourseFormData }) => {
      const totalLessons = data.curriculum.reduce((acc, section) => acc + section.lessons.length, 0);
      
      const payload = {
        title: data.title,
        titleAr: data.title,
        category: data.category,
        categoryAr: data.category,
        level: data.level,
        levelAr: data.level,
        price: parseInt(data.price) || 0,
        lessons: totalLessons,
        duration: data.duration,
        durationAr: data.duration,
        description: data.description || null,
        descriptionAr: data.description || null,
        instructor: data.instructor || null,
        instructorAr: data.instructor || null,
        instructorBio: data.instructorBio || null,
        instructorBioAr: data.instructorBio || null,
        objectives: data.objectives || null,
        objectivesAr: data.objectives || null,
        prerequisites: data.prerequisites || null,
        prerequisitesAr: data.prerequisites || null,
        status: data.status,
        curriculum: data.curriculum.length > 0 ? JSON.stringify(data.curriculum) : null,
        curriculumAr: data.curriculum.length > 0 ? JSON.stringify(data.curriculum) : null,
        image: data.image || null,
      };

      const response = await fetch(`/api/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast.success("تم تحديث الدورة بنجاح");
      setIsDialogOpen(false);
      setEditingCourse(null);
    },
    onError: () => {
      toast.error("فشل في تحديث الدورة");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast.success("Course deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete course");
    },
  });

  const quickStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (course: Course) => {
      const payload = {
        title: course.title + " (Copy)",
        titleAr: (course.titleAr || course.title) + " (نسخة)",
        category: course.category,
        categoryAr: course.categoryAr || course.category,
        level: course.level,
        levelAr: course.levelAr || course.level,
        price: course.price,
        lessons: course.lessons,
        duration: course.duration,
        durationAr: course.durationAr || course.duration,
        description: course.description || null,
        descriptionAr: course.descriptionAr || null,
        instructor: course.instructor || null,
        instructorAr: course.instructorAr || null,
        instructorBio: course.instructorBio || null,
        instructorBioAr: course.instructorBioAr || null,
        objectives: course.objectives || null,
        objectivesAr: course.objectivesAr || null,
        prerequisites: course.prerequisites || null,
        prerequisitesAr: course.prerequisitesAr || null,
        status: "draft",
        curriculum: course.curriculum || null,
        curriculumAr: course.curriculumAr || null,
        image: (course as any).image || null,
      };
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to duplicate");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast.success("Course duplicated as draft");
    },
    onError: () => toast.error("Failed to duplicate course"),
  });

  const handleSave = (data: CourseFormData) => {
    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCourse(null);
    setIsDialogOpen(true);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: courses.length,
    published: courses.filter(c => c.status === "published").length,
    draft: courses.filter(c => c.status === "draft").length,
    archived: courses.filter(c => c.status === "archived").length,
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-serif font-bold tracking-tight">Courses</h2>
          <p className="text-muted-foreground">Manage your educational content and catalog.</p>
        </div>
        <Button onClick={handleAdd} data-testid="button-add-course">
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* Stat mini-cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.all, icon: BookOpen, color: "text-blue-500" },
          { label: "Published", value: counts.published, icon: Eye, color: "text-green-500" },
          { label: "Drafts", value: counts.draft, icon: FileText, color: "text-amber-500" },
          { label: "Archived", value: counts.archived, icon: EyeOff, color: "text-slate-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card
            key={label}
            className="cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all"
            onClick={() => setStatusFilter(label.toLowerCase() as any)}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} />
              <div>
                <div className="text-xl font-bold leading-none">{isLoading ? "—" : value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="px-6 py-4 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-courses"
              />
            </div>
            {/* Status filter pills */}
            <div className="flex items-center gap-1 flex-wrap">
              {(["all", "published", "draft", "archived"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                    statusFilter === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {s} {s !== "all" && `(${counts[s]})`}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Lessons</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading courses...
                  </TableCell>
                </TableRow>
              ) : filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No courses found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.id} data-testid={`row-course-${course.id}`}>
                    <TableCell className="pr-0">
                      {(course as any).image ? (
                        <img
                          src={(course as any).image}
                          alt=""
                          className="w-10 h-10 rounded-md object-cover border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.titleAr || course.title}</div>
                        {course.titleAr && course.title !== course.titleAr && (
                          <div className="text-xs text-muted-foreground">{course.title}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{course.categoryAr || course.category}</TableCell>
                    <TableCell>{course.lessons}</TableCell>
                    <TableCell>{course.students ?? 0}</TableCell>
                    <TableCell>{course.price} OMR</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          course.status === "published" ? "bg-green-100 text-green-700 hover:bg-green-100" :
                          course.status === "draft" ? "bg-slate-100 text-slate-700 hover:bg-slate-100" :
                          "bg-red-100 text-red-700 hover:bg-red-100"
                        }
                      >
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-actions-${course.id}`}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(course)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {course.status === "published" ? (
                            <DropdownMenuItem onClick={() => quickStatusMutation.mutate({ id: course.id, status: "draft" })}>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Unpublish
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => quickStatusMutation.mutate({ id: course.id, status: "published" })}>
                              <Eye className="w-4 h-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => duplicateMutation.mutate(course)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this course?")) {
                                deleteMutation.mutate(course.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CourseEditor
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingCourse(null);
        }}
        editingCourse={editingCourse}
        onSave={handleSave}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </AdminLayout>
  );
}
