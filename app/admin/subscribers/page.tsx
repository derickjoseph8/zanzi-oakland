"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Mail,
  Download,
  Trash2,
  Search,
  MoreVertical,
  UserPlus,
  UserMinus,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch("/api/admin/subscribers");
      const data = await response.json();
      setSubscribers(data.subscribers || []);
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/admin/subscribers/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast({ title: "Subscriber Removed", variant: "success" });
      setDeleteId(null);
      fetchSubscribers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove subscriber",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (subscriber: Subscriber) => {
    try {
      const response = await fetch(`/api/admin/subscribers/${subscriber.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !subscriber.isActive }),
      });

      if (!response.ok) throw new Error("Failed to update");

      toast({
        title: subscriber.isActive ? "Subscriber Deactivated" : "Subscriber Activated",
        variant: "success",
      });

      fetchSubscribers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscriber",
        variant: "destructive",
      });
    }
  };

  const exportSubscribers = () => {
    const activeSubscribers = subscribers.filter((s) => s.isActive);
    const csv = [
      ["Email", "Name", "Subscribed Date"],
      ...activeSubscribers.map((s) => [
        s.email,
        s.name || "",
        new Date(s.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zanzi-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${activeSubscribers.length} subscribers`,
      variant: "success",
    });
  };

  const filteredSubscribers = subscribers.filter((s) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.email.toLowerCase().includes(query) ||
      s.name?.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: subscribers.length,
    active: subscribers.filter((s) => s.isActive).length,
    thisMonth: subscribers.filter((s) => {
      const subDate = new Date(s.createdAt);
      const now = new Date();
      return (
        subDate.getMonth() === now.getMonth() &&
        subDate.getFullYear() === now.getFullYear()
      );
    }).length,
  };

  if (loading) {
    return <div className="text-center text-white/60 py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Subscribers</h1>
          <p className="text-white/60 mt-1">Manage your email list</p>
        </div>
        <Button onClick={exportSubscribers} disabled={subscribers.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card glass className="p-4">
          <p className="text-sm text-white/60">Total Subscribers</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </Card>
        <Card glass className="p-4">
          <p className="text-sm text-white/60">Active</p>
          <p className="text-2xl font-bold text-green-500">{stats.active}</p>
        </Card>
        <Card glass className="p-4">
          <p className="text-sm text-white/60">Inactive</p>
          <p className="text-2xl font-bold text-white/50">
            {stats.total - stats.active}
          </p>
        </Card>
        <Card glass className="p-4">
          <p className="text-sm text-white/60">This Month</p>
          <p className="text-2xl font-bold text-gold-500">{stats.thisMonth}</p>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <Input
          placeholder="Search by email or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Subscribers Table */}
      {filteredSubscribers.length === 0 ? (
        <Card glass className="p-12 text-center">
          <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery ? "No Results" : "No Subscribers Yet"}
          </h3>
          <p className="text-white/60">
            {searchQuery
              ? "Try adjusting your search"
              : "Subscribers will appear here when people sign up"}
          </p>
        </Card>
      ) : (
        <Card glass>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-white/40" />
                        <span className="text-white">{subscriber.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-white/70">
                        {subscriber.name || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={subscriber.isActive ? "default" : "secondary"}
                      >
                        {subscriber.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-white/60">
                        <Calendar className="h-4 w-4" />
                        {formatDate(subscriber.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(subscriber.email);
                              toast({
                                title: "Email Copied",
                                variant: "success",
                              });
                            }}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Copy Email
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleActive(subscriber)}
                          >
                            {subscriber.isActive ? (
                              <>
                                <UserMinus className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteId(subscriber.id)}
                            className="text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination info */}
      {filteredSubscribers.length > 0 && (
        <p className="text-sm text-white/50 text-center">
          Showing {filteredSubscribers.length} of {subscribers.length} subscribers
        </p>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Subscriber?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this subscriber from your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
