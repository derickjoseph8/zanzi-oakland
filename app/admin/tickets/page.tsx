"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { QrCode, Search, CheckCircle, XCircle, Clock, Camera, CameraOff, Ticket, AlertTriangle, Volume2, VolumeX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  const [cameraActive, setCameraActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoValidate, setAutoValidate] = useState(true);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [recentScans, setRecentScans] = useState<Array<{
    code: string;
    name: string;
    status: "success" | "error" | "already_used";
    time: Date;
  }>>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    successAudioRef.current = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");
    errorAudioRef.current = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");
  }, []);

  const playSound = (type: "success" | "error") => {
    if (!soundEnabled) return;

    // Create a simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = type === "success" ? 880 : 220;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);

        // Start scanning for QR codes
        startScanning();
      }
    } catch (err) {
      console.error("Camera error:", err);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setCameraActive(false);
  };

  const startScanning = () => {
    if (scanIntervalRef.current) return;

    scanIntervalRef.current = setInterval(() => {
      scanQRCode();
    }, 200); // Scan every 200ms
  };

  const scanQRCode = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Use BarcodeDetector if available (modern browsers)
      if ("BarcodeDetector" in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        const barcodes = await barcodeDetector.detect(canvas);

        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue;
          if (code && code !== lastScannedCode) {
            setLastScannedCode(code);
            handleScannedCode(code);
          }
        }
      }
    } catch (err) {
      // BarcodeDetector not supported, fall back to manual input
    }
  };

  const handleScannedCode = async (code: string) => {
    setTicketCode(code);

    // Auto-lookup and validate
    const ticketData = await searchTicket(code);

    if (ticketData && ticketData.status === "VALID" && autoValidate) {
      // Auto-validate the ticket
      await validateTicketById(ticketData.id, ticketData.buyerName);
    }
  };

  const searchTicket = async (code: string): Promise<TicketInfo | null> => {
    if (!code.trim()) return null;

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
      return data.ticket;
    } catch (err: any) {
      setError(err.message);
      playSound("error");
      setRecentScans((prev) => [
        { code, name: "Unknown", status: "error", time: new Date() },
        ...prev.slice(0, 9),
      ]);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  const validateTicketById = async (ticketId: string, buyerName: string) => {
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}/validate`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to validate ticket");
      }

      // Success!
      setScanSuccess(true);
      playSound("success");

      toast({
        title: "Ticket Validated",
        description: `${buyerName} admitted`,
        variant: "success",
      });

      setRecentScans((prev) => [
        { code: ticketCode, name: buyerName, status: "success", time: new Date() },
        ...prev.slice(0, 9),
      ]);

      // Show success animation briefly
      setTimeout(() => {
        setScanSuccess(false);
        setTicketInfo(null);
        setTicketCode("");
        setLastScannedCode(null);
      }, 1500);

    } catch (err: any) {
      playSound("error");
      toast({
        title: "Validation Failed",
        description: err.message,
        variant: "destructive",
      });

      if (err.message.includes("already used")) {
        setRecentScans((prev) => [
          { code: ticketCode, name: buyerName, status: "already_used", time: new Date() },
          ...prev.slice(0, 9),
        ]);
      }
    }
  };

  const validateTicket = async () => {
    if (!ticketInfo) return;
    await validateTicketById(ticketInfo.id, ticketInfo.buyerName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchTicket(ticketCode);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
          <p className="text-white/60 mt-1">Scan QR codes to validate entry</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Badge variant="outline" className="gap-2">
            <QrCode className="h-3 w-3" />
            All Staff
          </Badge>
        </div>
      </div>

      {/* Camera Scanner */}
      <Card glass className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                QR Scanner
              </CardTitle>
              <CardDescription>
                Point camera at ticket QR code
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-white/60">
                <input
                  type="checkbox"
                  checked={autoValidate}
                  onChange={(e) => setAutoValidate(e.target.checked)}
                  className="rounded border-white/20"
                />
                Auto-validate
              </label>
              <Button
                onClick={cameraActive ? stopCamera : startCamera}
                variant={cameraActive ? "destructive" : "default"}
              >
                {cameraActive ? (
                  <>
                    <CameraOff className="h-4 w-4 mr-2" />
                    Stop Camera
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {cameraActive ? (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Scan overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-2 border-gold-500 rounded-2xl relative">
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-gold-500 rounded-tl-xl" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-gold-500 rounded-tr-xl" />
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-gold-500 rounded-bl-xl" />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-gold-500 rounded-br-xl" />

                    {/* Scanning line animation */}
                    <motion.div
                      className="absolute left-2 right-2 h-0.5 bg-gold-500"
                      animate={{
                        top: ["10%", "90%", "10%"],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </div>
                </div>

                {/* Success overlay */}
                <AnimatePresence>
                  {scanSuccess && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-green-500/30 flex items-center justify-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center"
                      >
                        <CheckCircle className="h-16 w-16 text-white" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="aspect-video bg-black/50 rounded-lg flex flex-col items-center justify-center">
                <Camera className="h-16 w-16 text-white/20 mb-4" />
                <p className="text-white/40">Camera not active</p>
                <p className="text-white/30 text-sm mt-1">Click &quot;Start Camera&quot; to begin scanning</p>
              </div>
            )}
          </div>

          {/* Manual input fallback */}
          <div className="mt-4">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1">
                <Input
                  ref={inputRef}
                  placeholder="Or enter ticket code manually..."
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  className="h-12"
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
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-red-500/50 bg-red-500/10">
              <CardContent className="pt-6 flex items-center gap-4">
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-red-500 font-medium text-lg">Ticket Not Found</p>
                  <p className="text-red-500/80">{error}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Info (when not auto-validating) */}
      <AnimatePresence>
        {ticketInfo && !autoValidate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
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
                      </div>
                    </div>
                  </div>

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
                        setLastScannedCode(null);
                      }}
                    >
                      Scan Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

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
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
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
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
