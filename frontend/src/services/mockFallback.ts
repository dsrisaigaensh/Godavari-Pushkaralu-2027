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

// -------------------------------------------------------------
// Central Mock Data Provider for Standalone Deployments (e.g. Vercel)
// -------------------------------------------------------------
export function getMockFallbackData(endpoint: string): any {
  const path = endpoint.split('?')[0];

  // 0. Authentication
  if (path.includes('/auth/login')) {
    return getMockLoginResponse('superadmin@civicproof.gov.in');
  }
  if (path.includes('/auth/me')) {
    return getMockUserForEmail('superadmin@civicproof.gov.in');
  }
  if (path.includes('/auth/logout')) {
    return { success: true };
  }
  if (path.includes('/auth/reset-password')) {
    return { message: 'Demo password reset link has been dispatched.' };
  }

  // 1. Dashboard Filters
  if (path.includes('/dashboard/filters')) {
    return {
      projects: [
        { id: 'proj-1', name: 'PRJ-WTR-01 - Drinking Water Kiosks & Pipeline Network' },
        { id: 'proj-2', name: 'PRJ-SAN-02 - Riverfront Bio-Toilet Blocks & Drainage' },
        { id: 'proj-3', name: 'PRJ-LGT-03 - High-Mast LED Ghat Illumination & Solar' },
        { id: 'proj-4', name: 'PRJ-SFT-04 - Riverbed Barricading & Deep-Water Safety Nets' },
      ],
      zones: [
        { id: 'zone-koti', name: 'Kotilingala Ghat' },
        { id: 'zone-pushkar', name: 'Pushkar Ghat' },
        { id: 'zone-saraswati', name: 'Saraswati Ghat' },
        { id: 'zone-dowles', name: 'Dowleswaram Barrage' },
      ],
      categories: ['Drinking Water', 'Sanitation', 'Public Lighting', 'Public Safety', 'Crowd Management'],
      vendors: [
        { id: 'ven-1', name: 'Delta Water Solutions & Utilities Ltd' },
        { id: 'ven-2', name: 'Godavari Infra Engineering Pvt Ltd' },
        { id: 'ven-3', name: 'Andhra Power Grid Infra Ltd' },
        { id: 'ven-4', name: 'Riverine Marine Safety Corp' },
      ],
      statuses: ['In Execution', 'Under Review', 'Accepted', 'Rework Required'],
      risk_levels: ['Critical', 'High', 'Moderate', 'Low'],
    };
  }

  // 2. Dashboard Metrics
  if (path.includes('/dashboard/metrics')) {
    return {
      total_projects: 8,
      active_works: 5,
      reported_complete_works: 2,
      verified_complete_works: 1,
      accepted_works: 1,
      works_at_risk: 3,
      overdue_milestones: 2,
      open_defects: 6,
      assets_registered: 84,
      assets_awaiting_inspection: 12,
      assets_accepted: 65,
      inspections_awaiting_action: 4,
      verified_readiness_score: 72,
    };
  }

  // 3. Dashboard Visualizations
  if (path.includes('/dashboard/visualizations')) {
    return {
      project_status_distribution: [
        { status: 'In Execution', count: 5, color: '#EA580C' },
        { status: 'Under Review', count: 1, color: '#F59E0B' },
        { status: 'Accepted', count: 1, color: '#16A34A' },
        { status: 'Rework Required', count: 1, color: '#DC2626' },
      ],
      reported_vs_verified_progress: [
        { work_id: 'WP-DW-KOTI-01', title: 'RO Chilling Plants', reported_progress: 100, verified_progress: 0, gap: 100, workflow_state: 'Rework Required' },
        { work_id: 'WP-DW-KOTI-02', title: 'Sub-surface Water Grid', reported_progress: 60, verified_progress: 50, gap: 10, workflow_state: 'In Execution' },
        { work_id: 'WP-SAN-PUSH-01', title: 'Bio-Toilet Block A', reported_progress: 85, verified_progress: 75, gap: 10, workflow_state: 'In Execution' },
        { work_id: 'WP-LGT-SARA-01', title: 'High-Mast Tower Grid', reported_progress: 90, verified_progress: 90, gap: 0, workflow_state: 'Under Review' },
      ],
      open_defects_by_severity: [
        { severity: 'Critical', count: 3, color: '#DC2626' },
        { severity: 'High', count: 2, color: '#F97316' },
        { severity: 'Medium', count: 1, color: '#FBBF24' },
      ],
      work_readiness_by_zone: [
        { zone_code: 'Z-KOTI', zone_name: 'Kotilingala Ghat', total_works: 4, verified_works: 3, readiness_percentage: 75 },
        { zone_code: 'Z-PUSH', zone_name: 'Pushkar Ghat', total_works: 3, verified_works: 2, readiness_percentage: 66 },
        { zone_code: 'Z-SARA', zone_name: 'Saraswati Ghat', total_works: 2, verified_works: 2, readiness_percentage: 100 },
        { zone_code: 'Z-DOWL', zone_name: 'Dowleswaram Barrage', total_works: 2, verified_works: 1, readiness_percentage: 50 },
      ],
      vendor_workload_performance: [
        { vendor_id: 'ven-1', vendor_name: 'Delta Water Solutions', category: 'Drinking Water', assigned_works: 2, open_defects: 2, completion_rate: 65 },
        { vendor_id: 'ven-2', vendor_name: 'Godavari Infra Engg', category: 'Civil Infrastructure', assigned_works: 3, open_defects: 3, completion_rate: 45 },
        { vendor_id: 'ven-3', vendor_name: 'Andhra Power Grid', category: 'Electrical', assigned_works: 1, open_defects: 0, completion_rate: 90 },
      ],
      upcoming_deadlines: [
        { id: 'd-1', work_id: 'WP-DW-KOTI-02', title: 'RO Plant Hydro-Testing', due_date: '2026-11-08T18:00:00Z', days_remaining: 3, is_overdue: false, category: 'Drinking Water' },
        { id: 'd-2', work_id: 'WP-SAN-PUSH-01', title: 'Bio-digester Sealing Inspection', due_date: '2026-11-05T18:00:00Z', days_remaining: 0, is_overdue: true, category: 'Sanitation' },
      ],
      recent_inspections: [
        { id: 'insp-1', inspection_id: 'INSP-2026-089', work_title: 'Sub-surface Water Filtration Grid', inspection_type: 'Quality Audit', outcome: 'Passed', date: '2026-11-05' },
        { id: 'insp-2', inspection_id: 'INSP-2026-088', work_title: 'Riverbed Safety Buoyancy Barricade', inspection_type: 'Safety Verification', outcome: 'Failed', date: '2026-11-04' },
      ],
      highest_priority_risks: [
        { work_id: 'WP-DW-KOTI-01', title: 'Automated RO Chilling Plants', risk_score: 90, risk_category: 'Critical', risk_explanation: 'Vendor reports 100% complete but 0% independently certified.', suggested_action: 'Deploy emergency QA team.' },
      ],
      recent_audit_events: [
        { id: 'aud-1', event_id: 'EVT-9921', action: 'STATUS_TRANSITION', actor: 'Sri K. Ramesh Babu, IAS', timestamp: '10 mins ago', entity: 'WP-DW-KOTI-02' },
        { id: 'aud-2', event_id: 'EVT-9920', action: 'INSPECTION_CERTIFIED', actor: 'M. Suresh Kumar', timestamp: '1 hour ago', entity: 'INSP-2026-089' },
      ],
    };
  }

  // 4. Action Queue
  if (path.includes('/dashboard/action-queue')) {
    return [
      {
        id: 'act-1',
        item_type: 'Defect Rework Required',
        title: 'Sanitation Block 4 – Main Ghat Bathing Bay',
        description: 'Inspection failed: vacuum seal leakage detected. Contractor rework re-inspection required.',
        severity: 'Critical',
        priority_order: 1,
        entity_type: 'defect',
        entity_id: 'def-1',
        link_url: '/defects',
        suggested_action: 'Dispatch QA Inspector to verify rework.',
      },
      {
        id: 'act-2',
        item_type: 'Overdue Milestone',
        title: 'Drinking Water Kiosk – Zone 3 (Pushkar Ghat)',
        description: 'Milestone "Pipe Laying and Hydro-Testing" overdue by 3 days.',
        severity: 'High',
        priority_order: 2,
        entity_type: 'project',
        entity_id: 'proj-1',
        link_url: '/projects',
        suggested_action: 'Issue contractual delay notice to vendor.',
      },
      {
        id: 'act-3',
        item_type: 'Readiness Gate Review',
        title: 'High-Mast Tower Grid Commissioning',
        description: 'All 12 readiness lifecycle stages satisfied. Ready for formal administrative acceptance.',
        severity: 'Moderate',
        priority_order: 3,
        entity_type: 'readiness',
        entity_id: 'wp-3',
        link_url: '/readiness',
        suggested_action: 'Review and sign off acceptance certificate.',
      },
    ];
  }

  // 5. Projects
  if (path.includes('/projects')) {
    // Single project detail
    if (path.match(/\/projects\/[a-zA-Z0-9_-]+/)) {
      return {
        id: 'proj-1',
        project_identifier: 'PRJ-WTR-01',
        name: 'Drinking Water Kiosks & Pipeline Network',
        description: 'High-capacity RO purification units and continuous pipeline distribution across Kotilingala and Pushkar Ghats.',
        category: 'Drinking Water',
        zone_id: 'zone-koti',
        zone_name: 'Kotilingala Ghat',
        current_status: 'In Execution',
        priority: 'Critical',
        created_at: '2026-01-15T09:00:00Z',
        work_packages_count: 2,
        reported_progress_avg: 80,
        verified_progress_avg: 25,
        department_name: 'Rural Water Supply & Sanitation (RWSS)',
        work_packages: [
          {
            id: 'wp-1',
            work_id: 'WP-DW-KOTI-01',
            project_id: 'proj-1',
            title: 'Automated RO Chilling Plants (4 x 5000 LPH)',
            category: 'Drinking Water',
            priority: 'Critical',
            vendor_name: 'Godavari Infra Engineering Pvt Ltd',
            reported_progress_percentage: 100,
            verified_progress_percentage: 0,
            workflow_state: 'Rework Required',
            risk_score: 90,
            risk_category: 'Critical',
            created_at: '2026-01-15T09:00:00Z',
            updated_at: '2026-11-04T12:00:00Z',
            milestones: [
              {
                id: 'ms-1',
                work_package_id: 'wp-1',
                name: 'Civil Foundation for RO Plant',
                due_date: '2026-03-01T00:00:00Z',
                is_mandatory: true,
                reported_status: 'Completed',
                verification_status: 'Verified Pass',
                created_at: '2026-01-15T09:00:00Z',
                dependencies: [],
              },
              {
                id: 'ms-2',
                work_package_id: 'wp-1',
                name: 'Equipment Installation & Hydro-Testing',
                due_date: '2026-11-01T00:00:00Z',
                is_mandatory: true,
                reported_status: 'Completed',
                verification_status: 'Failed - Rework Required',
                created_at: '2026-01-15T09:00:00Z',
                dependencies: [],
              },
            ],
            defects_count: 2,
            inspections_count: 3,
            assets_count: 4,
          },
          {
            id: 'wp-2',
            work_id: 'WP-DW-KOTI-02',
            project_id: 'proj-1',
            title: 'Sub-surface Water Filtration Grid',
            category: 'Drinking Water',
            priority: 'High',
            vendor_name: 'Delta Water Solutions & Utilities Ltd',
            reported_progress_percentage: 60,
            verified_progress_percentage: 50,
            workflow_state: 'In Execution',
            risk_score: 45,
            risk_category: 'Moderate',
            created_at: '2026-01-18T09:00:00Z',
            updated_at: '2026-11-05T12:00:00Z',
            milestones: [],
            defects_count: 1,
            inspections_count: 2,
            assets_count: 2,
          },
        ],
      };
    }

    // Projects summary list
    return [
      {
        id: 'proj-1',
        project_identifier: 'PRJ-WTR-01',
        name: 'Drinking Water Kiosks & Pipeline Network',
        description: 'High-capacity RO purification units and continuous pipeline distribution across Kotilingala and Pushkar Ghats.',
        category: 'Drinking Water',
        zone_id: 'zone-koti',
        zone_name: 'Kotilingala Ghat',
        current_status: 'In Execution',
        priority: 'Critical',
        created_at: '2026-01-15T09:00:00Z',
        work_packages_count: 2,
        reported_progress_avg: 80,
        verified_progress_avg: 25,
      },
      {
        id: 'proj-2',
        project_identifier: 'PRJ-SAN-02',
        name: 'Riverfront Bio-Toilet Blocks & Drainage',
        description: 'Pre-fabricated modular bio-toilets with vacuum sewer connections for 250,000 pilgrims/day capacity.',
        category: 'Sanitation',
        zone_id: 'zone-pushkar',
        zone_name: 'Pushkar Ghat',
        current_status: 'In Execution',
        priority: 'High',
        created_at: '2026-01-20T10:30:00Z',
        work_packages_count: 3,
        reported_progress_avg: 70,
        verified_progress_avg: 60,
      },
      {
        id: 'proj-3',
        project_identifier: 'PRJ-LGT-03',
        name: 'High-Mast LED Ghat Illumination & Backup Solar',
        description: 'Smart automated lighting towers with dual-grid redundancy and automatic failure failover.',
        category: 'Public Lighting',
        zone_id: 'zone-saraswati',
        zone_name: 'Saraswati Ghat',
        current_status: 'Under Review',
        priority: 'Medium',
        created_at: '2026-02-01T11:00:00Z',
        work_packages_count: 1,
        reported_progress_avg: 90,
        verified_progress_avg: 90,
      },
      {
        id: 'proj-4',
        project_identifier: 'PRJ-SFT-04',
        name: 'Riverbed Barricading & Deep-Water Safety Buoyancy Nets',
        description: 'Heavy-duty pontoon safety lines and underwater sensor barriers for holy bathing safety.',
        category: 'Public Safety',
        zone_id: 'zone-dowles',
        zone_name: 'Dowleswaram Barrage',
        current_status: 'Accepted',
        priority: 'Critical',
        created_at: '2026-01-10T08:00:00Z',
        work_packages_count: 2,
        reported_progress_avg: 100,
        verified_progress_avg: 100,
      },
    ];
  }

  // 6. Vendors
  if (path.includes('/vendors')) {
    if (path.includes('/vendors/me') || path.includes('/vendor-portal') || path.match(/\/vendors\/[a-zA-Z0-9_-]+/)) {
      return {
        vendor: {
          id: 'ven-1',
          vendor_code: 'VEN-AP-01',
          company_name: 'Godavari Infra Engineering Pvt Ltd',
          category: 'Civil & Hydraulic Infrastructure',
          contact_name: 'Rajesh Varma',
          email: 'vendor@infra-ap.com',
          phone: '+91 98480 12345',
          status: 'Active',
          compliance_status: 'Compliant',
          contract_reference: 'AP-RWS-PUSH-2026-0042',
          created_at: '2026-01-10T00:00:00Z',
          updated_at: '2026-11-04T00:00:00Z',
          assigned_packages_count: 3,
          active_packages_count: 2,
          total_contract_value: 125000000,
          is_financial_masked: false,
        },
        assigned_work_packages: [
          {
            id: 'wp-1',
            work_id: 'WP-DW-KOTI-01',
            package_code: 'PKG-01',
            title: 'Automated RO Chilling Plants (4 x 5000 LPH)',
            project_id: 'proj-1',
            project_name: 'Drinking Water Kiosks & Pipeline Network',
            category: 'Drinking Water',
            reported_progress_percentage: 100,
            verified_progress_percentage: 0,
            workflow_state: 'Rework Required',
            milestones_total: 2,
            milestones_completed: 1,
            open_defects_count: 2,
          },
        ],
        recent_submissions: [
          {
            id: 'sub-1',
            submission_code: 'SUB-2026-042',
            work_package_id: 'wp-1',
            vendor_id: 'ven-1',
            progress_percentage: 100,
            activities_description: 'Finished assembly of chilling units and connected power distribution lines.',
            submitted_at: '2026-11-03T14:00:00Z',
            review_status: 'Reviewed',
            reviewer_notes: 'Evidence photos verify physical assembly, but hydro-test certificates are absent. Defect logged.',
          },
        ],
        metrics: {
          active_contracts_count: 2,
          total_submissions_count: 5,
          approved_submissions_count: 3,
          pending_submissions_count: 1,
          rework_required_count: 1,
          overall_compliance_percentage: 85,
        },
      };
    }

    return [
      {
        id: 'ven-1',
        vendor_code: 'VEN-AP-01',
        company_name: 'Godavari Infra Engineering Pvt Ltd',
        category: 'Civil & Hydraulic Infrastructure',
        contact_name: 'Rajesh Varma',
        email: 'vendor@infra-ap.com',
        phone: '+91 98480 12345',
        status: 'Active',
        compliance_status: 'Compliant',
        contract_reference: 'AP-RWS-PUSH-2026-0042',
        created_at: '2026-01-10T00:00:00Z',
        updated_at: '2026-11-04T00:00:00Z',
        assigned_packages_count: 3,
        active_packages_count: 2,
        total_contract_value: 125000000,
        is_financial_masked: false,
      },
      {
        id: 'ven-2',
        vendor_code: 'VEN-AP-02',
        company_name: 'Delta Water Solutions & Utilities Ltd',
        category: 'Sanitation & Public Health',
        contact_name: 'Anil Kumar',
        email: 'info@deltawater.in',
        phone: '+91 98480 54321',
        status: 'Active',
        compliance_status: 'Compliant',
        contract_reference: 'AP-PH-PUSH-2026-0118',
        created_at: '2026-01-15T00:00:00Z',
        updated_at: '2026-11-05T00:00:00Z',
        assigned_packages_count: 2,
        active_packages_count: 2,
        total_contract_value: 84000000,
        is_financial_masked: false,
      },
      {
        id: 'ven-3',
        vendor_code: 'VEN-AP-03',
        company_name: 'Andhra Power Grid Infra Ltd',
        category: 'Electrical & Illumination',
        contact_name: 'P. Venkat',
        email: 'projects@apgrid-infra.com',
        phone: '+91 98480 99887',
        status: 'Active',
        compliance_status: 'Renewal Due',
        contract_reference: 'AP-DISCOM-2026-009',
        created_at: '2026-02-01T00:00:00Z',
        updated_at: '2026-11-02T00:00:00Z',
        assigned_packages_count: 1,
        active_packages_count: 1,
        total_contract_value: 45000000,
        is_financial_masked: false,
      },
    ];
  }

  // 7. Inspections
  if (path.includes('/inspections')) {
    if (path.includes('/inspections/stats')) {
      return { total: 18, passed: 12, failed: 3, scheduled: 3, compliance_rate: 80 };
    }

    if (path.match(/\/inspections\/[a-zA-Z0-9_-]+/)) {
      return {
        id: 'insp-1',
        inspection_id: 'INSP-2026-089',
        work_package_id: 'wp-1',
        work_package_title: 'Automated RO Chilling Plants',
        work_id: 'WP-DW-KOTI-01',
        project_id: 'proj-1',
        project_name: 'Drinking Water Kiosks & Pipeline Network',
        zone_name: 'Kotilingala Ghat',
        inspector_id: 'usr-inspector',
        inspector_name: 'M. Suresh Kumar',
        inspection_type: 'Statutory Milestone Certification',
        checklist_version: 'v2.1',
        outcome: 'Passed',
        is_geofence_verified: true,
        open_defects_count: 0,
        notes: 'Pre-commissioning physical alignment and pipeline joints inspected and certified on site.',
        created_at: '2026-11-05T09:00:00Z',
        checklist_results: [
          { item: 'Civil foundation concrete compressive strength test certified', verdict: 'Pass', measurement: 'M25 Grade' },
          { item: 'Stainless steel 316 food-grade piping verification', verdict: 'Pass', measurement: 'SS316 Certified' },
          { item: 'Hydrostatic pressure retention test (1.5x working pressure)', verdict: 'Pass', measurement: '6.2 Bar for 2 hrs' },
        ],
        evidence_photos: [
          { name: 'Intake_Flange_Inspection.jpg', caption: 'High pressure flange seal certified with torque tag', timestamp: '2026-11-05T11:20:00Z' },
        ],
      };
    }

    return [
      {
        id: 'insp-1',
        inspection_id: 'INSP-2026-089',
        work_package_id: 'wp-1',
        work_package_title: 'Automated RO Chilling Plants',
        work_id: 'WP-DW-KOTI-01',
        project_id: 'proj-1',
        project_name: 'Drinking Water Kiosks & Pipeline Network',
        zone_name: 'Kotilingala Ghat',
        inspector_name: 'M. Suresh Kumar',
        inspection_type: 'Milestone Certification',
        checklist_version: 'v2.1',
        outcome: 'Passed',
        is_geofence_verified: true,
        open_defects_count: 0,
        created_at: '2026-11-05T09:00:00Z',
      },
      {
        id: 'insp-2',
        inspection_id: 'INSP-2026-088',
        work_package_id: 'wp-4',
        work_package_title: 'Riverbed Safety Barricading',
        work_id: 'WP-SFT-DOWL-01',
        project_id: 'proj-4',
        project_name: 'Riverbed Barricading & Deep-Water Safety Nets',
        zone_name: 'Dowleswaram Barrage',
        inspector_name: 'M. Suresh Kumar',
        inspection_type: 'Quality Audit',
        checklist_version: 'v2.0',
        outcome: 'Failed',
        is_geofence_verified: true,
        open_defects_count: 2,
        created_at: '2026-11-04T09:00:00Z',
      },
    ];
  }

  // 8. Defects
  if (path.includes('/defects')) {
    if (path.includes('/defects/stats')) {
      return { total: 14, open: 6, in_rework: 3, awaiting_verification: 2, closed: 3, critical_count: 4 };
    }

    if (path.match(/\/defects\/[a-zA-Z0-9_-]+/)) {
      return {
        id: 'def-1',
        defect_id: 'DEF-2026-001',
        work_package_id: 'wp-1',
        work_package_title: 'Automated RO Chilling Plants',
        work_id: 'WP-DW-KOTI-01',
        project_name: 'Drinking Water Kiosks & Pipeline Network',
        zone_name: 'Kotilingala Ghat — Bathing Bay 3',
        title: 'Deep riverbed safety barricade anchor bolts improperly torqued',
        description: 'Physical inspection revealed anchor bolts on pontoon bracket 4B lack certified torque tension.',
        category: 'Quality & Structural Safety',
        severity: 'Critical',
        status: 'Open',
        rework_deadline: '2026-11-08T18:00:00Z',
        assigned_vendor_name: 'Godavari Infra Engineering Pvt Ltd',
        created_at: '2026-11-04T14:30:00Z',
        is_blocking: true,
      };
    }

    return [
      {
        id: 'def-1',
        defect_id: 'DEF-2026-001',
        work_package_id: 'wp-1',
        work_package_title: 'Automated RO Chilling Plants',
        work_id: 'WP-DW-KOTI-01',
        project_name: 'Drinking Water Kiosks & Pipeline Network',
        zone_name: 'Kotilingala Ghat',
        title: 'Deep riverbed safety barricade anchor bolts improperly torqued',
        description: 'Physical inspection revealed anchor bolts on pontoon bracket 4B lack certified torque tension.',
        category: 'Structural',
        severity: 'Critical',
        status: 'Open',
        rework_deadline: '2026-11-08T18:00:00Z',
        assigned_vendor_name: 'Godavari Infra Engineering Pvt Ltd',
        created_at: '2026-11-04T14:30:00Z',
        is_blocking: true,
      },
      {
        id: 'def-2',
        defect_id: 'DEF-2026-002',
        work_package_id: 'wp-2',
        work_package_title: 'Sub-surface Water Filtration Grid',
        work_id: 'WP-DW-KOTI-02',
        project_name: 'Drinking Water Kiosks & Pipeline Network',
        zone_name: 'Pushkar Ghat Intake Pump Station',
        title: 'Sub-surface water intake pump leaking at flange joint',
        description: 'Pressure test breached 2.4 bar threshold. Gasket replacement required immediately.',
        category: 'Mechanical',
        severity: 'High',
        status: 'In Progress',
        rework_deadline: '2026-11-07T12:00:00Z',
        assigned_vendor_name: 'Delta Water Solutions & Utilities Ltd',
        created_at: '2026-11-03T11:00:00Z',
        is_blocking: true,
      },
    ];
  }

  // 9. Assets
  if (path.includes('/assets')) {
    if (path.includes('/assets/stats')) {
      return { total: 84, operational: 65, maintenance_required: 12, decommissioned: 7, scanned_today: 28 };
    }

    if (path.match(/\/assets\/[a-zA-Z0-9_-]+/)) {
      return {
        id: 'ast-1',
        asset_code: 'AST-WTR-KOTI-001',
        name: 'High-Volume RO Water Dispenser #1',
        category: 'Drinking-water units',
        department: 'Rural Water Supply & Sanitation (RWSS)',
        location_name: 'Kotilingala Ghat North Promenade',
        serial_number: 'RO-DISP-2026-8832',
        lifecycle_status: 'Operationally Ready',
        qr_identifier: 'CP-QR-WTR-001-KOTI',
        created_at: '2026-02-10T10:00:00Z',
        is_operationally_ready: true,
        readiness_badge_text: 'Operationally Ready',
        readiness_badge_variant: 'success',
        open_defect_count: 0,
        maintenance_history: [
          { service_date: '2026-10-15', maintenance_type: 'Filter Replacement', technician_name: 'R. Koteswara Rao', summary: 'Pre-Pushkaralu sediment and carbon filters replaced.' },
        ],
        supporting_evidence: [
          { name: 'RO_Sanitization_Cert.pdf', caption: 'State Public Health Lab purity certificate', file_type: 'pdf' },
        ],
      };
    }

    return [
      {
        id: 'ast-1',
        asset_code: 'AST-WTR-KOTI-001',
        name: 'High-Volume RO Water Dispenser #1',
        category: 'Drinking-water units',
        department: 'Rural Water Supply & Sanitation (RWSS)',
        location_name: 'Kotilingala Ghat North Promenade',
        serial_number: 'RO-DISP-2026-8832',
        lifecycle_status: 'Operationally Ready',
        qr_identifier: 'CP-QR-WTR-001-KOTI',
        created_at: '2026-02-10T10:00:00Z',
        is_operationally_ready: true,
        readiness_badge_text: 'Operationally Ready',
        readiness_badge_variant: 'success',
        open_defect_count: 0,
        maintenance_history: [],
        supporting_evidence: [],
      },
      {
        id: 'ast-2',
        asset_code: 'AST-SAN-PUSH-012',
        name: 'Pre-fab Modular Bio-Toilet Block 2',
        category: 'Sanitation units',
        department: 'Public Health Engineering Department',
        location_name: 'Pushkar Ghat Central Arrival Plaza',
        serial_number: 'BIO-MOD-2026-042',
        lifecycle_status: 'Inspection Pending',
        qr_identifier: 'CP-QR-SAN-012-PUSH',
        created_at: '2026-02-12T10:00:00Z',
        is_operationally_ready: false,
        readiness_badge_text: 'Inspection Pending',
        readiness_badge_variant: 'warning',
        open_defect_count: 1,
        maintenance_history: [],
        supporting_evidence: [],
      },
    ];
  }

  // 10. Readiness Dashboard
  if (path.includes('/readiness')) {
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

  // 11. Dependencies & Graph
  if (path.includes('/dependencies')) {
    return {
      project_id: 'proj-1',
      total_nodes: 4,
      critical_path_node_ids: ['node-1', 'node-2', 'node-4'],
      critical_path_duration_days: 42,
      nodes: [
        {
          id: 'node-1',
          milestone_id: 'ms-1',
          work_package_id: 'wp-1',
          title: 'Sub-surface Foundation & Excavation',
          category: 'Drinking Water',
          duration_days: 14,
          due_date: '2026-03-01T00:00:00Z',
          status: 'Passed',
          is_critical: true,
          predecessor_ids: [],
          successor_ids: ['node-2'],
          risk_score: 10,
        },
        {
          id: 'node-2',
          milestone_id: 'ms-2',
          work_package_id: 'wp-1',
          title: 'Main Pipeline Laying & Joint Fusion',
          category: 'Drinking Water',
          duration_days: 21,
          due_date: '2026-05-15T00:00:00Z',
          status: 'In Progress',
          is_critical: true,
          predecessor_ids: ['node-1'],
          successor_ids: ['node-4'],
          risk_score: 65,
        },
        {
          id: 'node-3',
          milestone_id: 'ms-3',
          work_package_id: 'wp-2',
          title: 'Electrical Substation Feeder Line',
          category: 'Public Lighting',
          duration_days: 10,
          due_date: '2026-04-10T00:00:00Z',
          status: 'Passed',
          is_critical: false,
          predecessor_ids: [],
          successor_ids: ['node-4'],
          risk_score: 15,
        },
        {
          id: 'node-4',
          milestone_id: 'ms-4',
          work_package_id: 'wp-1',
          title: 'Commissioning & Water Purity Certification',
          category: 'Drinking Water',
          duration_days: 7,
          due_date: '2026-06-01T00:00:00Z',
          status: 'Pending',
          is_critical: true,
          predecessor_ids: ['node-2', 'node-3'],
          successor_ids: [],
          risk_score: 40,
        },
      ],
      edges: [
        { id: 'e-1', source_id: 'node-1', target_id: 'node-2', is_critical: true },
        { id: 'e-2', source_id: 'node-2', target_id: 'node-4', is_critical: true },
        { id: 'e-3', source_id: 'node-3', target_id: 'node-4', is_critical: false },
      ],
    };
  }

  // 12. Map Features
  if (path.includes('/map')) {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [81.7820, 17.0005] },
          properties: {
            id: 'feat-1',
            entity_type: 'project',
            code: 'PRJ-WTR-01',
            title: 'Kotilingala Water Treatment Hub',
            category: 'Drinking Water',
            status: 'In Execution',
            zone_name: 'Kotilingala Ghat',
            details_url: '/projects/proj-1',
            latitude: 17.0005,
            longitude: 81.7820,
            meta: {},
          },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [81.7865, 17.0042] },
          properties: {
            id: 'feat-2',
            entity_type: 'asset',
            code: 'AST-WTR-KOTI-001',
            title: 'High-Volume RO Water Dispenser #1',
            category: 'Drinking-water units',
            status: 'Operationally Ready',
            zone_name: 'Kotilingala Ghat',
            details_url: '/assets/ast-1',
            latitude: 17.0042,
            longitude: 81.7865,
            meta: {},
          },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [81.7790, 16.9950] },
          properties: {
            id: 'feat-3',
            entity_type: 'defect',
            code: 'DEF-2026-001',
            title: 'Pontoon Anchor Bolt Missing Torque Tag',
            category: 'Public Safety',
            status: 'Open',
            zone_name: 'Pushkar Ghat',
            details_url: '/defects/def-1',
            latitude: 16.9950,
            longitude: 81.7790,
            meta: {},
          },
        },
      ],
    };
  }

  // 13. Notifications
  if (path.includes('/notifications/unread-count')) {
    return 5;
  }
  if (path.includes('/notifications')) {
    return {
      unread_count: 5,
      total_count: 14,
      notifications: [
        {
          id: 'notif-1',
          title: 'Critical Defect Escalation',
          message: 'Anchor bolts missing torque certificate on Pontoon 4B at Kotilingala Ghat.',
          severity: 'critical',
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          is_read: false,
          link: '/defects',
          trigger_type: 'Defect',
        },
        {
          id: 'notif-2',
          title: 'Readiness Gate Awaiting Review',
          message: 'Work package WP-DW-KOTI-02 completed 12 stages and is ready for sign-off.',
          severity: 'info',
          created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          is_read: false,
          link: '/readiness',
          trigger_type: 'Readiness',
        },
        {
          id: 'notif-3',
          title: 'Inspection Verification Passed',
          message: 'Inspection INSP-2026-089 has been certified on site by M. Suresh Kumar.',
          severity: 'success',
          created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
          is_read: true,
          link: '/inspections',
          trigger_type: 'Inspection',
        },
      ],
    };
  }

  // 14. Tasks
  if (path.includes('/tasks') || path.includes('/my-tasks')) {
    return {
      summary: {
        total_tasks: 4,
        overdue_tasks: 1,
        due_today_tasks: 1,
        high_priority_tasks: 2,
      },
      tasks: [
        {
          id: 'tsk-1',
          task_type: 'inspection',
          title: 'Verify High-Mast Light Fixture Grounding',
          entity_id: 'insp-1',
          entity_code: 'INSP-2026-092',
          target_path: '/inspections',
          due_date: '2026-11-06T18:00:00Z',
          priority: 'high',
          days_remaining_or_overdue: 1,
          is_overdue: false,
          zone_name: 'Saraswati Ghat',
        },
        {
          id: 'tsk-2',
          task_type: 'defect',
          title: 'Re-inspect Pontoon 4B Anchor Bolt Torque',
          entity_id: 'def-1',
          entity_code: 'DEF-2026-001',
          target_path: '/defects',
          due_date: '2026-11-04T18:00:00Z',
          priority: 'critical',
          days_remaining_or_overdue: 1,
          is_overdue: true,
          zone_name: 'Kotilingala Ghat',
        },
      ],
    };
  }

  // 15. Reports
  if (path.includes('/reports')) {
    return {
      generated_at: new Date().toISOString(),
      report_type: 'EXECUTIVE_READINESS',
      records_count: 8,
      summary_kpis: {
        total_sanctioned_budget: 230000000,
        total_expenditure: 165000000,
        overall_readiness_score: 72,
        unverified_claims_blocked_inr: 32000000,
      },
      rows: [
        { id: 'rep-1', package_code: 'WP-DW-KOTI-01', name: 'Automated RO Plants', vendor: 'Godavari Infra', reported: 100, verified: 0, risk: 'Critical', gate: 'Blocked' },
        { id: 'rep-2', package_code: 'WP-DW-KOTI-02', name: 'Sub-surface Water Grid', vendor: 'Delta Water', reported: 60, verified: 50, risk: 'Moderate', gate: 'In Review' },
        { id: 'rep-3', package_code: 'WP-SFT-DOWL-01', name: 'Riverbed Safety Nets', vendor: 'Marine Safety Corp', reported: 100, verified: 100, risk: 'Low', gate: 'Accepted' },
      ],
    };
  }

  // 16. Audit Logs
  if (path.includes('/audit')) {
    return [
      {
        id: 'aud-1',
        action: 'USER_AUTHENTICATED_SUCCESS',
        actor_id: 'usr-superadmin',
        actor_email: 'superadmin@civicproof.gov.in',
        entity_type: 'User',
        entity_id: 'usr-superadmin',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        details: { persona: 'Sri K. Ramesh Babu, IAS' },
      },
      {
        id: 'aud-2',
        action: 'INSPECTION_CERTIFIED_PASS',
        actor_id: 'usr-inspector',
        actor_email: 'inspector@civicproof.gov.in',
        entity_type: 'Inspection',
        entity_id: 'insp-1',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        details: { geofence: 'Verified', inspection_id: 'INSP-2026-089' },
      },
    ];
  }

  // 17. Users
  if (path.includes('/users')) {
    return DEMO_ACCOUNTS.map((a) => getMockUserForEmail(a.email));
  }

  // 18. Roles
  if (path.includes('/roles')) {
    return DEMO_ACCOUNTS.map((a) => ({
      id: a.roleId,
      name: a.roleName,
      description: a.description,
      is_system_role: true,
      permissions: [
        { id: 'projects:read', name: 'Read Projects', category: 'Projects' },
        { id: 'projects:write', name: 'Write Projects', category: 'Projects' },
      ],
    }));
  }

  // 19. Departments
  if (path.includes('/departments')) {
    return [
      { id: 'dept-1', code: 'MUNI-HQ', name: 'Municipal Administration & Urban Development' },
      { id: 'dept-2', code: 'PWD-WTR', name: 'Water Works & Riverfront Drainage' },
      { id: 'dept-3', code: 'QA-INSP', name: 'Field Inspection & Quality Assurance Directorate' },
    ];
  }

  // Default empty list fallback
  return [];
}
