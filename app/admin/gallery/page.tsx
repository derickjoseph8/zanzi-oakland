"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
  Eye,
  EyeOff,
  MoreVertical,
  Grid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

interface GalleryImage {
  id: string;
  url: string;
  thumbnail: string | null;
  caption: string | null;
  category: string | null;
  isPublished: boolean;
  createdAt: string;
}

const CATEGORIES = [
  { value: "all", label: "All Photos" },
  { value: "nights", label: "Nights" },
  { value: "events", label: "Events" },
  { value: "vip", label: "VIP" },
  { value: "venue", label: "Venue" },
];

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<GalleryImage | null>(null);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadForm, setUploadForm] = useState({
    url: "",
    caption: "",
    category: "nights",
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/gallery");
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.url) {
      toast({
        title: "Error",
        description: "Please enter an image URL",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const response = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uploadForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast({ title: "Image Added", variant: "success" });
      setIsUploadDialogOpen(false);
      setUploadForm({ url: "", caption: "", category: "nights" });
      fetchImages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteImageId) return;

    try {
      const response = await fetch(`/api/gallery/${deleteImageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast({ title: "Image Deleted", variant: "success" });
      setDeleteImageId(null);
      fetchImages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const togglePublished = async (image: GalleryImage) => {
    try {
      const response = await fetch(`/api/gallery/${image.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !image.isPublished }),
      });

      if (!response.ok) throw new Error("Failed to update");

      toast({
        title: image.isPublished ? "Image Hidden" : "Image Published",
        variant: "success",
      });

      fetchImages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update image",
        variant: "destructive",
      });
    }
  };

  const filteredImages = selectedCategory === "all"
    ? images
    : images.filter((img) => img.category === selectedCategory);

  const stats = {
    total: images.length,
    published: images.filter((img) => img.isPublished).length,
    nights: images.filter((img) => img.category === "nights").length,
    events: images.filter((img) => img.category === "events").length,
  };

  if (loading) {
    return <div className="text-center text-white/60 py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Gallery</h1>
          <p className="text-white/60 mt-1">Manage photos and media</p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card glass className="p-4">
          <p className="text-sm text-white/60">Total Images</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </Card>
        <Card glass className="p-4">
          <p className="text-sm text-white/60">Published</p>
          <p className="text-2xl font-bold text-green-500">{stats.published}</p>
        </Card>
        <Card glass className="p-4">
          <p className="text-sm text-white/60">Nights</p>
          <p className="text-2xl font-bold text-white">{stats.nights}</p>
        </Card>
        <Card glass className="p-4">
          <p className="text-sm text-white/60">Events</p>
          <p className="text-2xl font-bold text-white">{stats.events}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList>
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Gallery */}
      {filteredImages.length === 0 ? (
        <Card glass className="p-12 text-center">
          <ImageIcon className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Images</h3>
          <p className="text-white/60 mb-6">
            {selectedCategory === "all"
              ? "Upload your first image to get started"
              : `No images in the "${selectedCategory}" category`}
          </p>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Image
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className={`group relative aspect-square rounded-lg overflow-hidden bg-white/5 ${
                !image.isPublished ? "opacity-60" : ""
              }`}
            >
              <Image
                src={image.url}
                alt={image.caption || "Gallery image"}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors" />

              {/* Overlay controls */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setPreviewImage(image)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => togglePublished(image)}
                  >
                    {image.isPublished ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => setDeleteImageId(image.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Status badge */}
              {!image.isPublished && (
                <Badge variant="secondary" className="absolute top-2 left-2">
                  Hidden
                </Badge>
              )}

              {/* Category badge */}
              {image.category && (
                <Badge className="absolute bottom-2 left-2">
                  {image.category}
                </Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card glass>
          <CardContent className="p-0">
            <div className="divide-y divide-white/10">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className={`flex items-center gap-4 p-4 ${
                    !image.isPublished ? "opacity-60" : ""
                  }`}
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={image.url}
                      alt={image.caption || "Gallery image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {image.caption || "Untitled"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {image.category && (
                        <Badge variant="outline">{image.category}</Badge>
                      )}
                      <Badge variant={image.isPublished ? "default" : "secondary"}>
                        {image.isPublished ? "Published" : "Hidden"}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setPreviewImage(image)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePublished(image)}>
                        {image.isPublished ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteImageId(image.id)}
                        className="text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
            <DialogDescription>
              Add a new image to your gallery
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={uploadForm.url}
                onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Caption (optional)</Label>
              <Input
                value={uploadForm.caption}
                onChange={(e) => setUploadForm({ ...uploadForm, caption: e.target.value })}
                placeholder="Describe this image"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={uploadForm.category}
                onValueChange={(value) => setUploadForm({ ...uploadForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter(c => c.value !== "all").map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {uploadForm.url && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-white/5">
                <Image
                  src={uploadForm.url}
                  alt="Preview"
                  fill
                  className="object-contain"
                  onError={() => {
                    toast({
                      title: "Invalid URL",
                      description: "Could not load image from URL",
                      variant: "destructive",
                    });
                  }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? "Adding..." : "Add Image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          {previewImage && (
            <>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-white/5">
                <Image
                  src={previewImage.url}
                  alt={previewImage.caption || "Gallery image"}
                  fill
                  className="object-contain"
                />
              </div>
              {previewImage.caption && (
                <p className="text-white/70 text-center">{previewImage.caption}</p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteImageId} onOpenChange={() => setDeleteImageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
