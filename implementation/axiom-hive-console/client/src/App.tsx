/**
 * Axiom Hive Technology — Project attribution: Alexis M. Adams and Nicholas Michael Grossi.
 * Research assistance: Manus AI. Attribution does not determine ownership or rights.
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import DashboardLayout from "./components/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Administration from "./pages/Administration";
import AuditLog from "./pages/AuditLog";
import DraftingRequests from "./pages/DraftingRequests";
import NotFound from "./pages/NotFound";
import Projects from "./pages/Projects";
import ReviewQueue from "./pages/ReviewQueue";
import type { ComponentType } from "react";

function ControlledRoute({ page: Page }: { page: ComponentType }) {
  return <DashboardLayout><Page /></DashboardLayout>;
}

function Router() {
  return <Switch>
    <Route path="/" component={() => <ControlledRoute page={Projects} />} />
    <Route path="/projects" component={() => <ControlledRoute page={Projects} />} />
    <Route path="/requests" component={() => <ControlledRoute page={DraftingRequests} />} />
    <Route path="/review" component={() => <ControlledRoute page={ReviewQueue} />} />
    <Route path="/audit" component={() => <ControlledRoute page={AuditLog} />} />
    <Route path="/admin" component={() => <ControlledRoute page={Administration} />} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster richColors position="top-right" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
