import type { User, TokenResponse } from '../types/auth';
import { DEMO_ACCOUNTS } from '../context/AuthContext';

export function getMockUserForEmail(email: string): User {
  const account = DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  ) || DEMO_ACCOUNTS[0];

  return {
    id: `usr-${account.roleId}`,
    username: account.email.split('@')[0],
    email: account.email,
    full_name: account.name,
    is_active: true,
    department: {
      id: 'dept-1',
      code: account.department.split(' ')[0] || 'HQ',
      name: account.department,
    },
    roles: [
      {
        id: account.roleId,
        name: account.roleName,
        description: account.description,
        is_system_role: true,
        permissions: [
          { id: 'projects:read', name: 'Read Projects', category: 'Projects' },
          { id: 'projects:write', name: 'Write Projects', category: 'Projects' },
          { id: 'inspections:read', name: 'Read Inspections', category: 'Inspections' },
          { id: 'inspections:write', name: 'Write Inspections', category: 'Inspections' },
          { id: 'defects:read', name: 'Read Defects', category: 'Defects' },
          { id: 'defects:write', name: 'Write Defects', category: 'Defects' },
          { id: 'assets:read', name: 'Read Assets', category: 'Assets' },
          { id: 'assets:write', name: 'Write Assets', category: 'Assets' },
          { id: 'vendors:read', name: 'Read Vendors', category: 'Vendors' },
          { id: 'readiness:read', name: 'Read Readiness', category: 'Readiness' },
          { id: 'readiness:evaluate', name: 'Evaluate Readiness', category: 'Readiness' },
          { id: 'acceptance:override', name: 'Acceptance Override', category: 'Readiness' },
          { id: 'reports:read', name: 'Read Reports', category: 'Reports' },
          { id: 'reports:export', name: 'Export Reports', category: 'Reports' },
          { id: 'audit:read', name: 'Read Audit', category: 'Audit' },
          { id: 'users:read', name: 'Read Users', category: 'Admin' },
          { id: 'users:write', name: 'Write Users', category: 'Admin' },
          { id: 'system:configure', name: 'Configure System', category: 'Admin' },
          { id: 'system:reset_demo', name: 'Reset Demo', category: 'Admin' },
        ],
      },
    ],
    permissions: [
      'projects:read',
      'projects:write',
      'inspections:read',
      'inspections:write',
      'defects:read',
      'defects:write',
      'assets:read',
      'assets:write',
      'vendors:read',
      'readiness:read',
      'readiness:evaluate',
      'acceptance:override',
      'reports:read',
      'reports:export',
      'audit:read',
      'users:read',
      'users:write',
      'system:configure',
      'system:reset_demo',
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function getMockLoginResponse(email: string): TokenResponse {
  const user = getMockUserForEmail(email);
  return {
    access_token: `mock-jwt-token-${user.id}`,
    token_type: 'bearer',
    user,
  };
}

export function getMockFallbackData(endpoint: string): any {
  // 0. Authentication
  if (endpoint.includes('/auth/login')) {
    return getMockLoginResponse('superadmin@civicproof.gov.in');
  }
  if (endpoint.includes('/auth/me')) {
    return getMockUserForEmail('superadmin@civicproof.gov.in');
  }
  if (endpoint.includes('/auth/logout')) {
    return { success: true };
  }

  // 1. Dashboard Metrics
  if (endpoint.includes('/dashboard/metrics')) {
    return {
      total_projects: 8,
      active_works: 4,
      reported_complete: 2,
      verified_complete: 1,
      accepted_works: 1,
      works_at_risk: 3,
      verified_readiness_score: 72,
    };
  }

  // 2. Dashboard Visualizations
  if (endpoint.includes('/dashboard/visualizations')) {
    return {
      readiness_gauge: {
        score: 72,
        on_track: 5,
        at_risk: 2,
        overdue: 1,
      },
      category_breakdown: [
        { category: 'Drinking Water', progress: 78, total: 3 },
        { category: 'Sanitation', progress: 65, total: 3 },
        { category: 'Public Safety', progress: 85, total: 2 },
        { category: 'Public Lighting', progress: 70, total: 2 },
      ],
      ghat_readiness: [
        { ghat: 'Kotilingala Ghat', score: 82 },
        { ghat: 'Pushkar Ghat', score: 76 },
        { ghat: 'Saraswati Ghat', score: 68 },
        { ghat: 'Markandeya Ghat', score: 71 },
      ],
    };
  }

  // 3. Action Queue
  if (endpoint.includes('/dashboard/action-queue')) {
    return [
      {
        id: 'act-1',
        title: 'Sanitation Block – Main Ghat',
        description: 'Inspection failed • Rework required',
        severity: 'Critical',
        due_in_days: 1,
        path: '/defects',
      },
      {
        id: 'act-2',
        title: 'Water Kiosk – Zone 3',
        description: 'Milestone overdue by 3 days',
        severity: 'Warning',
        due_in_days: 0,
        path: '/projects',
      },
      {
        id: 'act-3',
        title: 'Temporary Lighting – Zone 2',
        description: 'Evidence pending verification',
        severity: 'Info',
        due_in_days: 2,
        path: '/inspections',
      },
      {
        id: 'act-4',
        title: 'Drinking Water Unit – Zone 4',
        description: 'Inspection due tomorrow',
        severity: 'Info',
        due_in_days: 1,
        path: '/inspections',
      },
    ];
  }

  // 4. Projects
  if (endpoint.includes('/projects')) {
    return [
      {
        id: 'proj-1',
        project_identifier: 'PRJ-WTR-01',
        name: 'Drinking Water Kiosks & Pipeline Network',
        description: 'High-capacity RO purification units and continuous pipeline distribution across Kotilingala and Pushkar Ghats.',
        category: 'Drinking Water',
        zone_id: 'zone-koti',
        priority: 'Critical',
        budget_sanctioned: 85000000,
        expenditure_recorded: 54000000,
        workflow_state: 'In Execution',
        created_at: '2026-01-15T09:00:00Z',
      },
      {
        id: 'proj-2',
        project_identifier: 'PRJ-SAN-02',
        name: 'Riverfront Bio-Toilet Blocks & Drainage',
        description: 'Pre-fabricated modular bio-toilets with vacuum sewer connections for 250,000 pilgrims/day capacity.',
        category: 'Sanitation',
        zone_id: 'zone-pushkar',
        priority: 'High',
        budget_sanctioned: 62000000,
        expenditure_recorded: 41000000,
        workflow_state: 'In Execution',
        created_at: '2026-01-20T10:30:00Z',
      },
      {
        id: 'proj-3',
        project_identifier: 'PRJ-LGT-03',
        name: 'High-Mast LED Ghat Illumination & Backup Solar',
        description: 'Smart automated lighting towers with dual-grid redundancy and automatic failure failover.',
        category: 'Public Lighting',
        zone_id: 'zone-saraswati',
        priority: 'Medium',
        budget_sanctioned: 35000000,
        expenditure_recorded: 30000000,
        workflow_state: 'Verification Pending',
        created_at: '2026-02-01T11:00:00Z',
      },
      {
        id: 'proj-4',
        project_identifier: 'PRJ-SFT-04',
        name: 'Riverbed Barricading & Deep-Water Safety Buoyancy Nets',
        description: 'Heavy-duty pontoon safety lines and underwater sensor barriers for holy bathing safety.',
        category: 'Public Safety',
        zone_id: 'zone-dowles',
        priority: 'Critical',
        budget_sanctioned: 48000000,
        expenditure_recorded: 48000000,
        workflow_state: 'Accepted',
        created_at: '2026-01-10T08:00:00Z',
      },
    ];
  }

  // 5. Readiness Dashboard
  if (endpoint.includes('/readiness')) {
    return {
      average_risk_score: 54,
      total_work_packages: 5,
      accepted_work_packages: 1,
      pending_acceptance_count: 1,
      blocked_work_packages: 3,
      overdue_milestones_count: 2,
      open_blocking_defects_count: 12,
      risk_distribution: {
        All: 5,
        Critical: 3,
        High: 0,
        Moderate: 0,
        Low: 2,
      },
      highest_risk_work_packages: [
        {
          work_package_id: 'wp-1',
          work_id: 'WP-DW-KOTI-02',
          work_package_title: 'Sub-surface Water Filtration Grid',
          project_name: 'Demo — Public Drinking-Water Facility Readiness',
          category: 'Drinking Water',
          vendor_name: 'Delta Water Solutions & Utilities Ltd',
          reported_progress_percentage: 60,
          verified_progress_percentage: 50,
          risk_score: 100,
          risk_category: 'Critical',
          workflow_state: 'In Progress',
          factors: [
            {
              rule_name: 'Contractual Deadline Approaching',
              explanation: 'Milestone "Pipe Laying" overdue with zero verified test evidence submitted.',
            },
          ],
        },
        {
          work_package_id: 'wp-2',
          work_id: 'WP-DW-KOTI-01',
          work_package_title: 'Automated RO Chilling Plants',
          project_name: 'Demo — Public Drinking-Water Facility Readiness',
          category: 'Drinking Water',
          vendor_name: 'Godavari Infra Engineering Pvt Ltd',
          reported_progress_percentage: 100,
          verified_progress_percentage: 0,
          risk_score: 90,
          risk_category: 'Critical',
          workflow_state: 'Rework Required',
          factors: [
            {
              rule_name: 'Overdue Contractual Milestones',
              explanation: '1 milestone overdue and reported progress delta is 100% unverified.',
            },
          ],
        },
      ],
    };
  }

  // 6. Defects
  if (endpoint.includes('/defects/stats')) {
    return {
      total: 14,
      open: 6,
      in_rework: 3,
      awaiting_verification: 2,
      closed: 3,
      critical_count: 4,
    };
  }

  if (endpoint.includes('/defects')) {
    return [
      {
        id: 'def-1',
        defect_identifier: 'DEF-2026-001',
        title: 'Deep riverbed safety barricade anchor bolts improperly torqued',
        description: 'Physical inspection revealed anchor bolts on pontoon bracket 4B lack certified torque tension.',
        severity: 'Critical',
        status: 'Open',
        location_description: 'Kotilingala Ghat — Bathing Bay 3',
        reported_at: '2026-11-04T14:30:00Z',
        rework_deadline: '2026-11-08T18:00:00Z',
        work_package_title: 'Riverbed Barricading & Buoyancy Nets',
        assigned_vendor_name: 'Godavari Coastal Marine Structures',
      },
      {
        id: 'def-2',
        defect_identifier: 'DEF-2026-002',
        title: 'Sub-surface water intake pump leaking at flange joint',
        description: 'Pressure test breached 2.4 bar threshold. Gasket replacement required immediately.',
        severity: 'High',
        status: 'In Progress',
        location_description: 'Pushkar Ghat Intake Pump Station',
        reported_at: '2026-11-03T11:00:00Z',
        rework_deadline: '2026-11-07T12:00:00Z',
        work_package_title: 'Sub-surface Water Filtration Grid',
        assigned_vendor_name: 'Delta Water Solutions & Utilities Ltd',
      },
    ];
  }

  // 7. Inspections
  if (endpoint.includes('/inspections/stats')) {
    return {
      total: 18,
      passed: 12,
      failed: 3,
      scheduled: 3,
      compliance_rate: 80,
    };
  }

  if (endpoint.includes('/inspections')) {
    return [
      {
        id: 'insp-1',
        inspection_identifier: 'INSP-2026-089',
        work_package_title: 'Sub-surface Water Filtration Grid',
        project_name: 'Drinking Water Kiosks & Pipeline Network',
        inspector_name: 'M. Suresh Kumar',
        scheduled_date: '2026-11-05T09:00:00Z',
        executed_date: '2026-11-05T11:30:00Z',
        outcome: 'Passed',
        compliance_percentage: 92,
        checklists_count: 14,
        checklists_passed: 13,
      },
    ];
  }

  // 8. Assets
  if (endpoint.includes('/assets/stats')) {
    return {
      total: 84,
      operational: 65,
      maintenance_required: 12,
      decommissioned: 7,
      scanned_today: 28,
    };
  }

  if (endpoint.includes('/assets')) {
    return [
      {
        id: 'ast-1',
        asset_identifier: 'AST-WTR-KOTI-001',
        name: 'High-Volume RO Water Dispenser #1',
        category: 'Drinking-water units',
        department: 'Rural Water Supply & Sanitation (RWSS)',
        location_name: 'Kotilingala Ghat North Promenade',
        serial_number: 'RO-DISP-2026-8832',
        lifecycle_status: 'Operational',
        created_at: '2026-02-10T10:00:00Z',
      },
    ];
  }

  // 9. Vendors
  if (endpoint.includes('/vendors')) {
    return [
      {
        id: 'ven-1',
        name: 'Godavari Infra Engineering Pvt Ltd',
        vendor_code: 'VEN-AP-01',
        contact_person: 'Rajesh Varma',
        email: 'vendor@infra-ap.com',
        phone: '+91 98480 12345',
        qualification_status: 'Compliant',
        active_contracts_count: 3,
      },
      {
        id: 'ven-2',
        name: 'Delta Water Solutions & Utilities Ltd',
        vendor_code: 'VEN-AP-02',
        contact_person: 'Anil Kumar',
        email: 'info@deltawater.in',
        phone: '+91 98480 54321',
        qualification_status: 'Compliant',
        active_contracts_count: 2,
      },
    ];
  }

  // 10. Notifications
  if (endpoint.includes('/notifications/unread-count')) {
    return 5;
  }

  if (endpoint.includes('/notifications')) {
    return {
      unread_count: 5,
      items: [
        {
          id: 'notif-1',
          title: 'Critical Defect Reported',
          message: 'Anchor bolts missing torque certificate on Pontoon 4B.',
          severity: 'Critical',
          created_at: new Date().toISOString(),
          read: false,
          link: '/defects',
        },
        {
          id: 'notif-2',
          title: 'Readiness Gate Awaiting Review',
          message: 'Work package WP-DW-KOTI-02 completed 12 stages.',
          severity: 'Info',
          created_at: new Date().toISOString(),
          read: false,
          link: '/readiness',
        },
      ],
    };
  }

  // 11. Tasks
  if (endpoint.includes('/tasks')) {
    return {
      pending_count: 4,
      tasks: [
        {
          id: 'tsk-1',
          title: 'Review Bio-Toilet Inspection Checklist',
          due_date: '2026-11-06T18:00:00Z',
          priority: 'High',
          status: 'Pending',
        },
      ],
    };
  }

  // Default fallback
  return [];
}
