import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Subjects from "@/pages/subjects";
import Rafiki from "@/pages/rafiki";
import Progress from "@/pages/progress";
import SubjectDetail from "@/pages/subject-detail";
import Flashcards from "@/pages/flashcards";
import Quiz from "@/pages/quiz";
import Homework from "@/pages/homework";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // Auto-scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/subjects" component={Subjects} />
          <Route path="/subjects/:id" component={SubjectDetail} />
          <Route path="/rafiki" component={Rafiki} />
          <Route path="/progress" component={Progress} />
          <Route path="/flashcards/:topicId" component={Flashcards} />
          <Route path="/quiz/:quizId" component={Quiz} />
          <Route path="/homework/:homeworkId" component={Homework} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
