"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  Wine,
  Star,
  MoreVertical,
  GripVertical,
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
import { formatCurrency } from "@/lib/utils";

interface BottleCategory {
  id: string;
  name: string;
  order: number;
  bottles: Bottle[];
}

interface Bottle {
  id: string;
  name: string;
  categoryId: string;
  description: string | null;
  price: number;
  size: string | null;
  image: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
}

export default function BottlesPage() {
  const [categories, setCategories] = useState<BottleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBottleDialogOpen, setIsBottleDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingBottle, setEditingBottle] = useState<Bottle | null>(null);
  const [editingCategory, setEditingCategory] = useState<BottleCategory | null>(null);
  const [deleteBottleId, setDeleteBottleId] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  const [bottleForm, setBottleForm] = useState({
    name: "",
    categoryId: "",
    description: "",
    price: 0,
    size: "750ml",
    image: "",
    isAvailable: true,
    isFeatured: false,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/bottles");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch bottles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBottle = async () => {
    try {
      const url = editingBottle
        ? `/api/admin/bottles/${editingBottle.id}`
        : "/api/admin/bottles";
      const method = editingBottle ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bottleForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast({
        title: editingBottle ? "Bottle Updated" : "Bottle Added",
        variant: "success",
      });

      setIsBottleDialogOpen(false);
      setEditingBottle(null);
      resetBottleForm();
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save bottle",
        variant: "destructive",
      });
    }
  };

  const handleSaveCategory = async () => {
    try {
      const url = editingCategory
        ? `/api/admin/bottles/categories/${editingCategory.id}`
        : "/api/admin/bottles/categories";
      const method = editingCategory ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast({
        title: editingCategory ? "Category Updated" : "Category Created",
        variant: "success",
      });

      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: "" });
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBottle = async () => {
    if (!deleteBottleId) return;

    try {
      const response = await fetch(`/api/admin/bottles/${deleteBottleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast({ title: "Bottle Deleted", variant: "success" });
      setDeleteBottleId(null);
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete bottle",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;

    try {
      const response = await fetch(`/api/admin/bottles/categories/${deleteCategoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast({ title: "Category Deleted", variant: "success" });
      setDeleteCategoryId(null);
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (bottle: Bottle) => {
    try {
      const response = await fetch(`/api/admin/bottles/${bottle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !bottle.isAvailable }),
      });

      if (!response.ok) throw new Error("Failed to update");

      toast({
        title: bottle.isAvailable ? "Bottle Unavailable" : "Bottle Available",
        variant: "success",
      });

      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    }
  };

  const toggleFeatured = async (bottle: Bottle) => {
    try {
      const response = await fetch(`/api/admin/bottles/${bottle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !bottle.isFeatured }),
      });

      if (!response.ok) throw new Error("Failed to update");

      toast({
        title: bottle.isFeatured ? "Removed from Featured" : "Added to Featured",
        variant: "success",
      });

      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update",
        variant: "destructive",
      });
    }
  };

  const openEditBottle = (bottle: Bottle) => {
    setEditingBottle(bottle);
    setBottleForm({
      name: bottle.name,
      categoryId: bottle.categoryId,
      description: bottle.description || "",
      price: bottle.price,
      size: bottle.size || "750ml",
      image: bottle.image || "",
      isAvailable: bottle.isAvailable,
      isFeatured: bottle.isFeatured,
    });
    setIsBottleDialogOpen(true);
  };

  const resetBottleForm = () => {
    setBottleForm({
      name: "",
      categoryId: categories[0]?.id || "",
      description: "",
      price: 0,
      size: "750ml",
      image: "",
      isAvailable: true,
      isFeatured: false,
    });
  };

  const totalBottles = categories.reduce((sum, c) => sum + c.bottles.length, 0);
  const featuredBottles = categories.reduce(
    (sum, c) => sum + c.bottles.filter(b => b.isFeatured).length,
    0
  );

  if (loading) {
    return <div className="text-center text-white/60 py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Bottle Menu</h1>
          <p className="text-white/60 mt-1">Manage your bottle service offerings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            setCategoryForm({ name: "" });
            setEditingCategory(null);
            setIsCategoryDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
          <Button onClick={() => {
            resetBottleForm();
            setEditingBottle(null);
            setIsBottleDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Bottle
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card glass className="p-4">
          <p className="text-sm text-white/60">Categories</p>
          <p className="text-2xl font-bold text-white">{categories.length}</p>
        </Card>
        <Card glass className="p-4">
          <p className="text-sm text-white/60">Total Bottles</p>
          <p className="text-2xl font-bold text-white">{totalBottles}</p>
        </Card>
        <Card glass className="p-4">
          <p className="text-sm text-white/60">Featured</p>
          <p className="text-2xl font-bold text-gold-500">{featuredBottles}</p>
        </Card>
        <Card glass className="p-4">
          <p className="text-sm text-white/60">Available</p>
          <p className="text-2xl font-bold text-green-500">
            {categories.reduce((sum, c) => sum + c.bottles.filter(b => b.isAvailable).length, 0)}
          </p>
        </Card>
      </div>

      {/* Categories and Bottles */}
      {categories.length === 0 ? (
        <Card glass className="p-12 text-center">
          <Wine className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Categories Yet</h3>
          <p className="text-white/60 mb-6">Create categories to organize your bottles</p>
          <Button onClick={() => setIsCategoryDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Category
          </Button>
        </Card>
      ) : (
        <Tabs defaultValue={categories[0]?.name}>
          <TabsList className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.name}>
                {category.name} ({category.bottles.length})
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.name}>
              <Card glass>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{category.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setEditingCategory(category);
                        setCategoryForm({ name: category.name });
                        setIsCategoryDialogOpen(true);
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Category
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteCategoryId(category.id)}
                        className="text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Category
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  {category.bottles.length === 0 ? (
                    <p className="text-white/50 text-center py-8">No bottles in this category</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {category.bottles.map((bottle) => (
                        <div
                          key={bottle.id}
                          className={`p-4 rounded-lg border ${
                            bottle.isAvailable
                              ? "bg-white/5 border-white/10"
                              : "bg-white/2 border-white/5 opacity-60"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-white">{bottle.name}</h4>
                                {bottle.isFeatured && (
                                  <Star className="h-4 w-4 text-gold-500 fill-gold-500" />
                                )}
                              </div>
                              {bottle.size && (
                                <p className="text-sm text-white/50">{bottle.size}</p>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditBottle(bottle)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleFeatured(bottle)}>
                                  <Star className="h-4 w-4 mr-2" />
                                  {bottle.isFeatured ? "Remove Featured" : "Make Featured"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleAvailability(bottle)}>
                                  {bottle.isAvailable ? "Mark Unavailable" : "Mark Available"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setDeleteBottleId(bottle.id)}
                                  className="text-red-400"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          {bottle.description && (
                            <p className="text-sm text-white/60 mb-3 line-clamp-2">
                              {bottle.description}
                            </p>
                          )}
                          <p className="text-xl font-bold text-gold-500">
                            {formatCurrency(bottle.price)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Bottle Dialog */}
      <Dialog open={isBottleDialogOpen} onOpenChange={setIsBottleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBottle ? "Edit Bottle" : "Add Bottle"}</DialogTitle>
            <DialogDescription>
              {editingBottle ? "Update bottle details" : "Add a new bottle to your menu"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Bottle Name</Label>
              <Input
                value={bottleForm.name}
                onChange={(e) => setBottleForm({ ...bottleForm, name: e.target.value })}
                placeholder="e.g., Dom Pérignon"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={bottleForm.categoryId}
                onValueChange={(value) => setBottleForm({ ...bottleForm, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  value={bottleForm.price}
                  onChange={(e) => setBottleForm({ ...bottleForm, price: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Size</Label>
                <Input
                  value={bottleForm.size}
                  onChange={(e) => setBottleForm({ ...bottleForm, size: e.target.value })}
                  placeholder="750ml"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={bottleForm.description}
                onChange={(e) => setBottleForm({ ...bottleForm, description: e.target.value })}
                placeholder="Optional description"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={bottleForm.image}
                onChange={(e) => setBottleForm({ ...bottleForm, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Available</Label>
              <Switch
                checked={bottleForm.isAvailable}
                onCheckedChange={(checked) => setBottleForm({ ...bottleForm, isAvailable: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Featured</Label>
              <Switch
                checked={bottleForm.isFeatured}
                onCheckedChange={(checked) => setBottleForm({ ...bottleForm, isFeatured: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBottleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBottle}>
              {editingBottle ? "Save Changes" : "Add Bottle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g., Champagne, Vodka, Whiskey"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Bottle Confirmation */}
      <AlertDialog open={!!deleteBottleId} onOpenChange={() => setDeleteBottleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bottle?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBottle} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the category and all bottles within it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
