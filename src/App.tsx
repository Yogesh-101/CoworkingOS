import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './components/landing/LandingPage';
import { RoleSelectScreen } from './components/auth/RoleSelectScreen';
import { LoginScreen } from './components/auth/LoginScreen';
import { SupportChatbot } from './components/intelligence/SupportChatbot';
import { useStore } from './store';

const DashboardOverview = lazy(() =>
  import('./components/dashboard/DashboardOverview').then((m) => ({ default: m.DashboardOverview }))
);
const FloorMap = lazy(() =>
  import('./components/dashboard/FloorMap').then((m) => ({ default: m.FloorMap }))
);
const CRM = lazy(() => import('./components/dashboard/CRM').then((m) => ({ default: m.CRM })));
const Visitors = lazy(() =>
  import('./components/dashboard/Visitors').then((m) => ({ default: m.Visitors }))
);
const Helpdesk = lazy(() =>
  import('./components/dashboard/Helpdesk').then((m) => ({ default: m.Helpdesk }))
);
const Billing = lazy(() =>
  import('./components/dashboard/Billing').then((m) => ({ default: m.Billing }))
);
const TeamChat = lazy(() =>
  import('./components/dashboard/TeamChat').then((m) => ({ default: m.TeamChat }))
);
const WebsiteCMS = lazy(() =>
  import('./components/dashboard/WebsiteCMS').then((m) => ({ default: m.WebsiteCMS }))
);
const ErpPage = lazy(() =>
  import('./components/dashboard/AdminPanel').then((m) => ({ default: m.ErpPage }))
);
const IntelligenceHub = lazy(() =>
  import('./components/dashboard/IntelligenceHub').then((m) => ({ default: m.IntelligenceHub }))
);
const Settings = lazy(() =>
  import('./components/dashboard/Settings').then((m) => ({ default: m.Settings }))
);

function ModuleFallback() {
  return (
    <div className="flex h-64 items-center justify-center text-sm font-medium text-zinc-500">
      Loading module…
    </div>
  );
}

function ActiveModule() {
  const activeTab = useStore((state) => state.activeTab);

  let module: ReactNode;
  switch (activeTab) {
    case 'dashboard':
      module = <DashboardOverview />;
      break;
    case 'floor-map':
      module = <FloorMap />;
      break;
    case 'crm':
      module = <CRM />;
      break;
    case 'visitors':
      module = <Visitors />;
      break;
    case 'helpdesk':
      module = <Helpdesk />;
      break;
    case 'billing':
      module = <Billing />;
      break;
    case 'team-chat':
      module = <TeamChat />;
      break;
    case 'cms':
      module = <WebsiteCMS />;
      break;
    case 'erp':
      module = <ErpPage />;
      break;
    case 'intelligence':
      module = <IntelligenceHub />;
      break;
    case 'settings':
      module = <Settings />;
      break;
    default:
      module = <DashboardOverview />;
  }

  return <Suspense fallback={<ModuleFallback />}>{module}</Suspense>;
}

function preloadAppModules() {
  void import('./components/dashboard/Billing');
  void import('./components/dashboard/TeamChat');
  void import('./components/dashboard/WebsiteCMS');
  void import('./components/dashboard/AdminPanel');
  void import('./components/dashboard/IntelligenceHub');
}

export default function App() {
  const view = useStore((state) => state.view);

  useEffect(() => {
    if (view === 'app') preloadAppModules();
  }, [view]);

  return (
    <>
      {view === 'landing' && <LandingPage />}
      {view === 'role-select' && <RoleSelectScreen />}
      {view === 'login' && <LoginScreen />}
      {view === 'app' && (
        <Layout>
          <ActiveModule />
        </Layout>
      )}
      <SupportChatbot />
    </>
  );
}
