import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminRequests from "@/pages/admin/requests";
import AdminCourses from "@/pages/admin/courses";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminUsers from "@/pages/admin/users";
import AdminPayments from "@/pages/admin/payments";
import AdminConsultationTypes from "@/pages/admin/consultation-types";
import AdminConsultationAvailability from "@/pages/admin/consultation-availability";
import AdminSettings from "@/pages/admin/settings";
import Consultations from "@/pages/consultations";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/course-detail";
import MyCourses from "@/pages/my-courses";
import LearningPaths from "@/pages/learning-paths";
import Corporate from "@/pages/corporate";
import Tools from "@/pages/tools";
import GmailTracker from "@/pages/gmail-tracker";
import AuthPage from "@/pages/AuthPage";
import i18n from "@/lib/i18n";
import { I18nextProvider } from "react-i18next";
import { WhatsAppFab } from "@/components/whatsapp-fab";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/learn" component={LearningPaths} />
      <Route path="/learning-paths" component={LearningPaths} />
      <Route path="/courses" component={Courses} />
      <Route path="/courses/:id" component={CourseDetail} />
      <Route path="/my-courses" component={MyCourses} />
      <Route path="/tools" component={Tools} />
      <Route path="/gmail-tracker" component={GmailTracker} />
      <Route path="/consultations" component={Consultations} />
      <Route path="/corporate" component={Corporate} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/signup" component={AuthPage} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/requests" component={AdminRequests} />
      <Route path="/admin/payments" component={AdminPayments} />
      <Route path="/admin/courses" component={AdminCourses} />
      <Route path="/admin/consultation-types" component={AdminConsultationTypes} />
      <Route path="/admin/consultation-availability" component={AdminConsultationAvailability} />
      <Route path="/admin/settings" component={AdminSettings} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
          <WhatsAppFab />
        </TooltipProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}

export default App;