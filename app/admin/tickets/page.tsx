"use client";

import { useState, useEffect, useRef } from "react";
import { QrCode, Search, CheckCircle, XCircle, Clock, User, Ticket, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";

interface TicketInfo {
  id: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  status: "VALID" | "USED" | "CANCELLED" | "REFUNDED";
  event: {
    title: string;
    date: string;
  };
  usedAt?: string;
  createdAt: string;
}

export default function TicketScannerPage() {
  const [ticketCode, setTicketCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<Array<{
    code: string;
    name: string;
    status: "success" | "error" | "already_used";
    time: Date;
  }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const searchTicket = async (code: string) => {
    if (!code.trim()) return;

    setIsSearching(true);
    setError(null);
    setTicketInfo(null);

    try {
      const response = await fetch(`/api/admin/tickets/lookup?code=${encodeURIComponent(code)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ticket not found");
      }

      setTicketInfo(data.ticket);
    } catch (err: any) {
      setError(err.message);
      setRecentScans((prev) => [
        { code, name: "Unknown", status: "error", time: new Date() },
        ...prev.slice(0, 9),
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  const validateTicket = async () => {
    if (!ticketInfo) return;

    try {
      const response = await fetch(`/api/admin/tickets/${ticketInfo.id}/validate`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to validate ticket");
      }

      toast({
        title: "Ticket Validated",
        description: `${ticketInfo.buyerName} - ${ticketInfo.quantity} ticket(s) admitted`,
        variant: "success",
      });

      setRecentScans((prev) => [
        { code: ticketCode, name: ticketInfo.buyerName, status: "success", time: new Date() },
        ...prev.slice(0, 9),
      ]);

      // Update ticket info to show as used
      setTicketInfo({ ...ticketInfo, status: "USED", usedAt: new Date().toISOString() });
      setTicketCode("");
      inputRef.current?.focus();
    } catch (err: any) {
      toast({
        title: "Validation Failed",
        description: err.message,
        variant: "destructive",
      });

      if (err.message.includes("already used")) {
        setRecentScans((prev) => [
          { code: ticketCode, name: ticketInfo.buyerName, status: "already_used", time: new Date() },
          ...prev.slice(0, 9),
        ]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchTicket(ticketCode);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VALID":
        return <Badge className="bg-green-500/20 text-green-500">Valid</Badge>;
      case "USED":
        return <Badge className="bg-yellow-500/20 text-yellow-500">Already Used</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-500/20 text-red-500">Cancelled</Badge>;
      case "REFUNDED":
        return <Badge className="bg-gray-500/20 text-gray-400">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Ticket Scanner</h1>
          <p className="text-white/60 mt-1">Scan or enter ticket codes to validate entry</p>
        </div>
        <Badge variant="outline" className="gap-2">
          <QrCode className="h-3 w-3" />
          All Staff
        </Badge>
      </div>

      {/* Scanner Input */}
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scan Ticket
          </CardTitle>
          <CardDescription>
            Scan a QR code or manually enter the ticket code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1">
              <Input
                ref={inputRef}
                placeholder="Enter ticket code or scan QR..."
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                className="text-lg h-12"
                autoFocus
              />
            </div>
            <Button type="submit" size="lg" disabled={isSearching || !ticketCode.trim()}>
              {isSearching ? (
                <Clock className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span className="ml-2">Look Up</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="pt-6 flex items-center gap-4">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-red-500 font-medium text-lg">Ticket Not Found</p>
              <p className="text-red-500/80">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ticket Info */}
      {ticketInfo && (
        <Card glass>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  ticketInfo.status === "VALID"
                    ? "bg-green-500/20"
                    : ticketInfo.status === "USED"
                    ? "bg-yellow-500/20"
                    : "bg-red-500/20"
                }`}>
                  {ticketInfo.status === "VALID" ? (
                    <Ticket className="h-8 w-8 text-green-500" />
                  ) : ticketInfo.status === "USED" ? (
                    <CheckCircle className="h-8 w-8 text-yellow-500" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-white">{ticketInfo.buyerName}</h3>
                    {getStatusBadge(ticketInfo.status)}
                  </div>
                  <p className="text-white/60">{ticketInfo.buyerEmail}</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-white">
                      <span className="text-white/60">Event:</span> {ticketInfo.event.title}
                    </p>
                    <p className="text-white">
                      <span className="text-white/60">Date:</span> {formatDate(ticketInfo.event.date)}
                    </p>
                    <p className="text-white">
                      <span className="text-white/60">Quantity:</span> {ticketInfo.quantity} ticket(s)
                    </p>
                    {ticketInfo.usedAt && (
                      <p className="text-yellow-500">
                        <span className="text-yellow-500/60">Used at:</span> {formatDate(ticketInfo.usedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {ticketInfo.status === "VALID" && (
                  <Button onClick={validateTicket} size="lg" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Admit Entry
                  </Button>
                )}
                {ticketInfo.status === "USED" && (
                  <div className="flex items-center gap-2 text-yellow-500">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Already admitted</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setTicketInfo(null);
                    setTicketCode("");
                    inputRef.current?.focus();
                  }}
                >
                  Scan Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <Card glass>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
            <CardDescription>Last 10 ticket scans this session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentScans.map((scan, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    scan.status === "success"
                      ? "bg-green-500/10"
                      : scan.status === "already_used"
                      ? "bg-yellow-500/10"
                      : "bg-red-500/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {scan.status === "success" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : scan.status === "already_used" ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="text-white font-medium">{scan.name}</p>
                      <p className="text-sm text-white/50">{scan.code.substring(0, 16)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${
                      scan.status === "success"
                        ? "text-green-500"
                        : scan.status === "already_used"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}>
                      {scan.status === "success" ? "Admitted" : scan.status === "already_used" ? "Already Used" : "Invalid"}
                    </p>
                    <p className="text-xs text-white/40">
                      {scan.time.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
