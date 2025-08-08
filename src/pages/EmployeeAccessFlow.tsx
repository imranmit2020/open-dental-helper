import { useEffect } from "react";
import { ArrowDown, UserPlus, Building, User, Shield, Cog, CheckCircle2, ClipboardList } from "lucide-react";

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function EmployeeAccessFlow() {
  useEffect(() => {
    document.title = "Employee Access Flow | Administration"; // SEO title
    setMeta('description', 'Visual flow for employee registration, clinic assignment, role assignment, and module permissions.');

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.href);
  }, []);

  const steps = [
    {
      title: 'Employee Registration',
      icon: UserPlus,
      description: 'Create or invite an employee for the current clinic. Email invite or direct add.',
    },
    {
      title: 'Clinic Assignment',
      icon: Building,
      description: 'Link the user to the clinic (tenant). Determines patient/record visibility.',
    },
    {
      title: 'Role Assignment',
      icon: User,
      description: 'Assign role: admin, dentist, or staff. Super admin can view across clinics.',
    },
    {
      title: 'Module Permissions',
      icon: Shield,
      description: 'Enable access to modules (Scheduling, AI tools, Billing, Compliance, etc.).',
    },
    {
      title: 'Approval & Activation',
      icon: CheckCircle2,
      description: 'Activate user. Optional review by clinic admin; super admin oversight at corporate.',
    },
    {
      title: 'Ongoing Management',
      icon: Cog,
      description: 'Reset passwords, adjust roles and permissions, deactivate/reactivate as needed.',
    },
  ];

  return (
    <article className="w-full max-w-5xl mx-auto px-4 md:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Employee Access Flow</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          End-to-end flow for per-clinic employee onboarding and access. Super admin operates at corporate level.
        </p>
      </header>

      <main>
        <section aria-label="Employee access flow diagram" className="relative">
          <div className="grid grid-cols-1 gap-6">
            {steps.map((s, idx) => (
              <div key={s.title} className="relative">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 rounded-lg p-2 bg-gradient-to-br from-primary to-secondary text-white shadow">
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold leading-snug">{idx + 1}. {s.title}</h2>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{s.description}</p>
                    </div>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className="flex justify-center my-2" aria-hidden="true">
                    <ArrowDown className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <aside className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/admin/roles" className="group rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3 hover:shadow transition-shadow">
            <ClipboardList className="w-4 h-4 text-primary" />
            <div>
              <div className="font-medium">Go to Role Assignment</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Assign roles to employees for this clinic</div>
            </div>
          </a>
          <a href="/admin/passwords" className="group rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3 hover:shadow transition-shadow">
            <Shield className="w-4 h-4 text-primary" />
            <div>
              <div className="font-medium">Go to Password Management</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Admins and super admins can reset passwords</div>
            </div>
          </a>
        </aside>
      </main>
    </article>
  );
}
