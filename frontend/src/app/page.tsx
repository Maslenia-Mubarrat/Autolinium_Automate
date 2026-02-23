import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white font-mono">
      <Card className="max-w-md border-2 border-primary shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tighter text-primary uppercase">
            Autolinium // System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground mb-4">
            Welcome to the internal office & KPI management system.
          </p>
          <div className="p-2 border-l-2 border-primary bg-slate-50">
            <code className="text-xs">STATUS: SYSTEM_READY_V1.0</code>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
