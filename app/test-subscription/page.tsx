"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestSubscriptionPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/test-subscription");
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error(error);
      setStatus({ error: "Failed to check subscription" });
    } finally {
      setLoading(false);
    }
  };

  const activateSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/test-subscription", { method: "POST" });
      const data = await res.json();
      setStatus(data);
      if (data.success) {
        alert("Subscription activated! Refresh the page or go to /dashboard");
      }
    } catch (error) {
      console.error(error);
      setStatus({ error: "Failed to activate subscription" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Subscription Activation</CardTitle>
          <CardDescription>
            This is a test page to manually activate your subscription since webhooks can't reach localhost.
            <br />
            <strong>DELETE THIS PAGE IN PRODUCTION!</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={checkSubscription} disabled={loading} variant="outline">
              Check Subscription Status
            </Button>
            <Button onClick={activateSubscription} disabled={loading}>
              Activate Subscription
            </Button>
          </div>

          {status && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(status, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "Check Subscription Status" to see your current status</li>
              <li>Click "Activate Subscription" to manually activate for testing</li>
              <li>After activation, go to <code className="bg-muted px-1">/dashboard</code> or any protected route</li>
              <li>You should now have access!</li>
            </ol>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
            <h3 className="font-semibold mb-2">For Production:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Use ngrok or similar to expose your local server: <code className="bg-muted px-1">ngrok http 3003</code></li>
              <li>Configure webhook URL in Dodo Payments dashboard: <code className="bg-muted px-1">https://your-ngrok-url/api/webhooks/dodo</code></li>
              <li>Set DODO_WEBHOOK_SECRET in .env.local</li>
              <li>Test payment will trigger webhook automatically</li>
              <li>DELETE this test page and API route!</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
