"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Table2,
  Users,
  DollarSign,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";

interface Section {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  tables: Table[];
}

interface Table {
  id: string;
  name: string;
  sectionId: string;
  capacity: number;
  minimumSpend: number | null;
  depositRequired: number | null;
  requiresBottle: boolean;
  isActive: boolean;
  shape: string;
}

export default function TablesPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [deleteTableId, setDeleteTableId] = useState<string | null>(null);
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null);

  const [tableForm, setTableForm] = useState({
    name: "",
    sectionId: "",
    capacity: 6,
    minimumSpend: 500,
    depositRequired: 150,
    requiresBottle: false,
    shape: "BOOTH",
  });

  const [sectionForm, setSectionForm] = useState({
    name: "",
    description: "",
    color: "#d4af37",
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch("/api/admin/tables");
      const data = await response.json();
      setSections(data.sections || []);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTable = async () => {
    try {
      const url = editingTable
        ? `/api/admin/tables/${editingTable.id}`
        : "/api/admin/tables";
      const method = editingTable ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tableForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast({
        title: editingTable ? "Table Updated" : "Table Created",
        variant: "success",
      });

      setIsTableDialogOpen(false);
      setEditingTable(null);
      resetTableForm();
      fetchSections();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save table",
        variant: "destructive",
      });
    }
  };

  const handleSaveSection = async () => {
    try {
      const url = editingSection
        ? `/api/admin/tables/sections/${editingSection.id}`
        : "/api/admin/tables/sections";
      const method = editingSection ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sectionForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast({
        title: editingSection ? "Section Updated" : "Section Created",
        variant: "success",
      });

      setIsSectionDialogOpen(false);
      setEditingSection(null);
      resetSectionForm();
      fetchSections();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save section",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTable = async () => {
    if (!deleteTableId) return;

    try {
      const response = await fetch(`/api/admin/tables/${deleteTableId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast({ title: "Table Deleted", variant: "success" });
      setDeleteTableId(null);
      fetchSections();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete table",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSection = async () => {
    if (!deleteSectionId) return;

    try {
      const response = await fetch(`/api/admin/tables/sections/${deleteSectionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast({ title: "Section Deleted", variant: "success" });
      setDeleteSectionId(null);
      fetchSections();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete section",
        variant: "destructive",
      });
    }
  };

  const openEditTable = (table: Table) => {
    setEditingTable(table);
    setTableForm({
      name: table.name,
      sectionId: table.sectionId,
      capacity: table.capacity,
      minimumSpend: table.minimumSpend || 0,
      depositRequired: table.depositRequired || 0,
      requiresBottle: table.requiresBottle,
      shape: table.shape,
    });
    setIsTableDialogOpen(true);
  };

  const openEditSection = (section: Section) => {
    setEditingSection(section);
    setSectionForm({
      name: section.name,
      description: section.description || "",
      color: section.color || "#d4af37",
    });
    setIsSectionDialogOpen(true);
  };

  const resetTableForm = () => {
    setTableForm({
      name: "",
      sectionId: sections[0]?.id || "",
      capacity: 6,
      minimumSpend: 500,
      depositRequired: 150,
      requiresBottle: false,
      shape: "BOOTH",
    });
  };

  const resetSectionForm = () => {
    setSectionForm({
      name: "",
      description: "",
      color: "#d4af37",
    });
  };

  const totalTables = sections.reduce((sum, s) => sum + s.tables.length, 0);
  const totalCapacity = sections.reduce(
    (sum, s) => sum + s.tables.reduce((t, table) => t + table.capacity, 0),
    0
  );

  if (loading) {
    return <div className="text-center text-white/60 py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Tables & Sections</h1>
          <p className="text-white/60 mt-1">Manage floor plan sections and tables</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            resetSectionForm();
            setEditingSection(null);
            setIsSectionDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
          <Button onClick={() => {
            resetTableForm();
            setEditingTable(null);
            setIsTableDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Table
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card glass className="p-4">
          <p className="text-sm text-white/60">Sections</p>
          <p className="text-2xl font-bold text-white">{sections.length}</p>
        </Card>
        <Card glass className="p-4">
          <p className="text-sm text-white/60">Total Tables</p>
          <p className="text-2xl font-bold text-white">{totalTables}</p>
        </Card>
        <Card glass className="p-4">
          <p className="text-sm text-white/60">Total Capacity</p>
          <p className="text-2xl font-bold text-white">{totalCapacity}</p>
        </Card>
        <Card glass className="p-4">
          <p className="text-sm text-white/60">Active Tables</p>
          <p className="text-2xl font-bold text-gold-500">
            {sections.reduce((sum, s) => sum + s.tables.filter(t => t.isActive).length, 0)}
          </p>
        </Card>
      </div>

      {/* Sections and Tables */}
      {sections.length === 0 ? (
        <Card glass className="p-12 text-center">
          <Table2 className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Sections Yet</h3>
          <p className="text-white/60 mb-6">Create sections to organize your tables</p>
          <Button onClick={() => setIsSectionDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Section
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <Card key={section.id} glass>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: section.color || "#d4af37" }}
                  />
                  <div>
                    <CardTitle>{section.name}</CardTitle>
                    {section.description && (
                      <p className="text-sm text-white/60">{section.description}</p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditSection(section)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Section
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteSectionId(section.id)}
                      className="text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Section
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                {section.tables.length === 0 ? (
                  <p className="text-white/50 text-center py-4">No tables in this section</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.tables.map((table) => (
                      <div
                        key={table.id}
                        className="p-4 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-white">{table.name}</h4>
                            <Badge variant={table.isActive ? "default" : "secondary"} className="mt-1">
                              {table.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditTable(table)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteTableId(table.id)}
                                className="text-red-400"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-white/70">
                            <Users className="h-4 w-4" />
                            Capacity: {table.capacity}
                          </div>
                          {table.minimumSpend && (
                            <div className="flex items-center gap-2 text-white/70">
                              <DollarSign className="h-4 w-4" />
                              Min Spend: {formatCurrency(table.minimumSpend)}
                            </div>
                          )}
                          {table.depositRequired && (
                            <div className="flex items-center gap-2 text-gold-500">
                              Deposit: {formatCurrency(table.depositRequired)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table Dialog */}
      <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTable ? "Edit Table" : "Add Table"}</DialogTitle>
            <DialogDescription>
              {editingTable ? "Update table details" : "Create a new table"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Table Name</Label>
              <Input
                value={tableForm.name}
                onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                placeholder="e.g., VIP 1, Booth A"
              />
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Select
                value={tableForm.sectionId}
                onValueChange={(value) => setTableForm({ ...tableForm, sectionId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input
                  type="number"
                  value={tableForm.capacity}
                  onChange={(e) => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Shape</Label>
                <Select
                  value={tableForm.shape}
                  onValueChange={(value) => setTableForm({ ...tableForm, shape: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BOOTH">Booth</SelectItem>
                    <SelectItem value="CIRCLE">Circle</SelectItem>
                    <SelectItem value="SQUARE">Square</SelectItem>
                    <SelectItem value="RECTANGLE">Rectangle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Spend ($)</Label>
                <Input
                  type="number"
                  value={tableForm.minimumSpend}
                  onChange={(e) => setTableForm({ ...tableForm, minimumSpend: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Deposit Required ($)</Label>
                <Input
                  type="number"
                  value={tableForm.depositRequired}
                  onChange={(e) => setTableForm({ ...tableForm, depositRequired: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Requires Bottle Service</Label>
              <Switch
                checked={tableForm.requiresBottle}
                onCheckedChange={(checked) => setTableForm({ ...tableForm, requiresBottle: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTableDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTable}>
              {editingTable ? "Save Changes" : "Create Table"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Dialog */}
      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSection ? "Edit Section" : "Add Section"}</DialogTitle>
            <DialogDescription>
              {editingSection ? "Update section details" : "Create a new section"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Section Name</Label>
              <Input
                value={sectionForm.name}
                onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                placeholder="e.g., VIP, Main Floor, Balcony"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={sectionForm.description}
                onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={sectionForm.color}
                  onChange={(e) => setSectionForm({ ...sectionForm, color: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={sectionForm.color}
                  onChange={(e) => setSectionForm({ ...sectionForm, color: e.target.value })}
                  placeholder="#d4af37"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSection}>
              {editingSection ? "Save Changes" : "Create Section"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Table Confirmation */}
      <AlertDialog open={!!deleteTableId} onOpenChange={() => setDeleteTableId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Table?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Existing reservations for this table may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTable} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Section Confirmation */}
      <AlertDialog open={!!deleteSectionId} onOpenChange={() => setDeleteSectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the section and all tables within it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSection} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
