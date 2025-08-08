import { useEffect } from "react";
import { Link } from "react-router-dom";
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
    document.title = "Employee and Staff Access Process | Administration"; // SEO title
    setMeta('description', 'Visual process for employee and staff onboarding, clinic assignment, roles, permissions, and activation.');

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
      to: '/admin/employees/new',
    },
    {
      title: 'Clinic Assignment',
      icon: Building,
      description: 'Link the user to the clinic (tenant) to scope access to clinic data.',
      to: '/admin/employees',
    },
    {
      title: 'Role Assignment',
      icon: User,
      description: 'Assign role: admin, dentist, or staff. Super admin can also manage at corporate.',
      to: '/admin/roles',
    },
    {
      title: 'Module Permissions',
      icon: Shield,
      description: 'Enable access to modules (Scheduling, AI tools, Billing, Compliance, etc.).',
      to: '/settings',
    },
    {
      title: 'Approval & Activation',
      icon: CheckCircle2,
      description: 'Approve new users and activate access; clinic admin primary, super admin oversight.',
      to: '/admin/user-approvals',
    },
    {
      title: 'Ongoing Management',
      icon: Cog,
      description: 'Reset passwords, adjust roles and permissions, deactivate/reactivate as needed.',
      to: '/admin/passwords',
    },
  ];

  return (
    <article className="w-full max-w-5xl mx-auto px-4 md:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Employee and Staff Access Process</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          End-to-end flow for per-clinic employee onboarding and access. Super admin operates at corporate level.
        </p>
      </header>

      <main>
        <section aria-label="Employee access flow diagram" className="relative">
          <div className="grid grid-cols-1 gap-6">
            {steps.map((s, idx) => (
              <div key={s.title} className="relative">
                <Link to={s.to} className="block rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/40">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 rounded-lg p-2 bg-gradient-to-br from-primary to-secondary text-white shadow">
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold leading-snug">{idx + 1}. {s.title}</h2>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{s.description}</p>
                    </div>
                  </div>
                </Link>
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
          <a href="/admin/employees/new" className="group rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3 hover:shadow transition-shadow">
            <UserPlus className="w-4 h-4 text-primary" />
            <div>
              <div className="font-medium">Add New Employee</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Start registration for this clinic</div>
            </div>
          </a>
          <a href="/admin/user-approvals" className="group rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3 hover:shadow transition-shadow">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <div>
              <div className="font-medium">Go to Approvals</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Review and activate pending users</div>
            </div>
          </a>
        </aside>
      </main>
    </article>
  );
}
