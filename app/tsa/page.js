"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TSAPage() {
  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center gap-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">TSA Information</h2>
          <p className="text-muted-foreground">
            2009-901 Software Development Project
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Repository</CardTitle>
            <CardDescription>
              Access the source code and development history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground mb-4">
                This project&apos;s complete source code is open source and
                available on GitHub:
              </p>
              <div className="bg-muted rounded-md p-3 flex items-center justify-between">
                <code className="text-sm">
                  https://github.com/pranavbehal/garden-ai
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      "https://github.com/pranavbehal/garden-ai",
                      "_blank"
                    )
                  }
                >
                  View Repository
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Stack</CardTitle>
            <CardDescription>
              Technologies and frameworks used in this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium">Framework</span>
                <span className="text-sm text-muted-foreground">
                  Next.js 15
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium">UI Components</span>
                <span className="text-sm text-muted-foreground">shadcn/ui</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium">Styling</span>
                <span className="text-sm text-muted-foreground">
                  Tailwind CSS
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium">AI Integration</span>
                <span className="text-sm text-muted-foreground">
                  Vercel AI SDK
                </span>
              </div>
              {/* <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-medium">Database</span>
                <span className="text-sm text-muted-foreground">
                  Supabase (Planned)
                </span>
              </div> */}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About the Project</CardTitle>
            <CardDescription>
              Garden AI is an intelligent, AI-powered gardening assistant that
              helps users manage their plants and get AI-powered advice about
              how to grow them well. Our application can also provide
              personalized plant care recommendations based on its history, as
              well as local growing information. Our project solves the issue of
              a lack of education when it comes to plants and local agricultural
              conditions, and by allowing users to learn more, we can increase
              the amount of sustainable and efficient agriculural efforts made
              in our communities.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
