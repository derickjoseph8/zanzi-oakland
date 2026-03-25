"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Save, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface ApiKeysFormProps {
  initialSettings: Record<string, any>;
}

export function ApiKeysForm({ initialSettings }: ApiKeysFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const { register, handleSubmit } = useForm({
    defaultValues: {
      squareAccessToken: initialSettings.square_access_token?.value || "",
      squareApplicationId: initialSettings.square_application_id?.value || "",
      squareLocationId: initialSettings.square_location_id?.value || "",
      stripeSecretKey: initialSettings.stripe_secret_key?.value || "",
      stripePublishableKey: initialSettings.stripe_publishable_key?.value || "",
      stripeWebhookSecret: initialSettings.stripe_webhook_secret?.value || "",
      uploadthingSecret: initialSettings.uploadthing_secret?.value || "",
      uploadthingAppId: initialSettings.uploadthing_app_id?.value || "",
    },
  });

  const toggleShowKey = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Save each API key as a secret setting
      const apiKeys = [
        { key: "square_access_token", value: data.squareAccessToken },
        { key: "square_application_id", value: data.squareApplicationId },
        { key: "square_location_id", value: data.squareLocationId },
        { key: "stripe_secret_key", value: data.stripeSecretKey },
        { key: "stripe_publishable_key", value: data.stripePublishableKey },
        { key: "stripe_webhook_secret", value: data.stripeWebhookSecret },
        { key: "uploadthing_secret", value: data.uploadthingSecret },
        { key: "uploadthing_app_id", value: data.uploadthingAppId },
      ];

      for (const { key, value } of apiKeys) {
        if (value) {
          await fetch("/api/admin/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, value, isSecret: true }),
          });
        }
      }

      toast({
        title: "API Keys Saved",
        description: "Your API keys have been securely stored.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API keys. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const SecretInput = ({
    id,
    label,
    register: reg,
    placeholder,
  }: {
    id: string;
    label: string;
    register: any;
    placeholder?: string;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={showKeys[id] ? "text" : "password"}
          {...reg}
          placeholder={placeholder}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => toggleShowKey(id)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
        >
          {showKeys[id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Warning */}
      <Card className="border-yellow-500/50 bg-yellow-500/10">
        <CardContent className="pt-6 flex items-start gap-4">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-500 font-medium">Sensitive Information</p>
            <p className="text-sm text-yellow-500/80">
              API keys are stored securely and encrypted. Never share these keys with anyone.
              Make sure to use production keys only when your site is live.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Square */}
      <Card glass>
        <CardHeader>
          <CardTitle>Square Payment</CardTitle>
          <CardDescription>Primary payment processor for deposits and tickets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SecretInput
            id="squareAccessToken"
            label="Access Token"
            register={register("squareAccessToken")}
            placeholder="sq0atp-..."
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <SecretInput
              id="squareApplicationId"
              label="Application ID"
              register={register("squareApplicationId")}
              placeholder="sq0idp-..."
            />
            <SecretInput
              id="squareLocationId"
              label="Location ID"
              register={register("squareLocationId")}
              placeholder="Location ID"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stripe */}
      <Card glass>
        <CardHeader>
          <CardTitle>Stripe Payment (Fallback)</CardTitle>
          <CardDescription>Secondary payment processor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <SecretInput
              id="stripeSecretKey"
              label="Secret Key"
              register={register("stripeSecretKey")}
              placeholder="sk_..."
            />
            <SecretInput
              id="stripePublishableKey"
              label="Publishable Key"
              register={register("stripePublishableKey")}
              placeholder="pk_..."
            />
          </div>
          <SecretInput
            id="stripeWebhookSecret"
            label="Webhook Secret"
            register={register("stripeWebhookSecret")}
            placeholder="whsec_..."
          />
        </CardContent>
      </Card>

      {/* Uploadthing */}
      <Card glass>
        <CardHeader>
          <CardTitle>Uploadthing (Media Storage)</CardTitle>
          <CardDescription>For image and file uploads</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <SecretInput
              id="uploadthingSecret"
              label="Secret"
              register={register("uploadthingSecret")}
              placeholder="sk_live_..."
            />
            <SecretInput
              id="uploadthingAppId"
              label="App ID"
              register={register("uploadthingAppId")}
              placeholder="App ID"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save API Keys
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
