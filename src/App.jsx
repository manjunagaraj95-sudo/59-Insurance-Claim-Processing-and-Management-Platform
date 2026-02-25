
import React, { useState, useEffect } from 'react';

// --- Constants ---

const ROLES = {
  POLICYHOLDER: 'POLICYHOLDER',
  CLAIMS_OFFICER: 'CLAIMS_OFFICER',
  VERIFICATION_OFFICER: 'VERIFICATION_OFFICER',
  FINANCE_TEAM: 'FINANCE_TEAM',
  ADMIN: 'ADMIN',
};

const STATUS_MAP = {
  CLAIM: {
    SUBMITTED: { label: 'Submitted', color: 'var(--status-submitted)' },
    PENDING_VERIFICATION: { label: 'Pending Verification', color: 'var(--status-pending-verification)' },
    IN_REVIEW: { label: 'In Review', color: 'var(--status-in-review)' },
    APPROVED: { label: 'Approved', color: 'var(--status-approved)' },
    REJECTED: { label: 'Rejected', color: 'var(--status-rejected)' },
    SETTLED: { label: 'Settled', color: 'var(--status-settled)' },
    CLOSED: { label: 'Closed', color: 'var(--status-closed)' },
  },
  POLICY: {
    ACTIVE: { label: 'Active', color: 'var(--status-active)' },
    EXPIRED: { label: 'Expired', color: 'var(--status-expired)' },
    CANCELLED: { label: 'Cancelled', color: 'var(--status-cancelled)' },
  },
};

const CLAIMS_DATA = [
  {
    id: 'C001',
    policyId: 'P101',
    policyholder: 'Alice Wonderland',
    type: 'Auto Accident',
    description: 'Collision with another vehicle on main street.',
    submissionDate: '2023-10-26',
    status: 'PENDING_VERIFICATION',
    amountRequested: 5500.00,
    documents: ['Accident Report.pdf', 'Photos.zip'],
    assignedTo: 'John Doe (Claims Officer)',
    lastUpdate: '2023-10-27',
    workflow: [
      { stage: 'Submission', date: '2023-10-26', by: 'Alice Wonderland', status: 'completed', slaBreach: false },
      { stage: 'Verification', date: '2023-10-27', by: 'System', status: 'active', slaBreach: false },
      { stage: 'Review', date: null, by: null, status: 'pending', slaBreach: false },
      { stage: 'Approval', date: null, by: null, status: 'pending', slaBreach: false },
      { stage: 'Settlement', date: null, by: null, status: 'pending', slaBreach: false },
    ],
    auditLogs: [
      { timestamp: '2023-10-26T10:00:00Z', user: 'Alice Wonderland', action: 'Claim C001 submitted' },
      { timestamp: '2023-10-27T11:30:00Z', user: 'System', action: 'Initial verification initiated for C001' },
    ],
  },
  {
    id: 'C002',
    policyId: 'P102',
    policyholder: 'Bob The Builder',
    type: 'Home Damage',
    description: 'Roof damage due to heavy storm.',
    submissionDate: '2023-10-20',
    status: 'APPROVED',
    amountRequested: 12000.00,
    documents: ['Roof Report.pdf', 'Invoice.pdf'],
    assignedTo: 'Jane Smith (Claims Officer)',
    lastUpdate: '2023-10-25',
    workflow: [
      { stage: 'Submission', date: '2023-10-20', by: 'Bob The Builder', status: 'completed', slaBreach: false },
      { stage: 'Verification', date: '2023-10-21', by: 'Mike V (Verification Officer)', status: 'completed', slaBreach: false },
      { stage: 'Review', date: '2023-10-23', by: 'Jane Smith (Claims Officer)', status: 'completed', slaBreach: false },
      { stage: 'Approval', date: '2023-10-25', by: 'Admin User', status: 'completed', slaBreach: false },
      { stage: 'Settlement', date: null, by: null, status: 'pending', slaBreach: false },
    ],
    auditLogs: [
      { timestamp: '2023-10-20T14:00:00Z', user: 'Bob The Builder', action: 'Claim C002 submitted' },
      { timestamp: '2023-10-21T09:00:00Z', user: 'Mike V', action: 'Documents verified for C002' },
      { timestamp: '2023-10-23T10:00:00Z', user: 'Jane Smith', action: 'Claim C002 moved to review' },
      { timestamp: '2023-10-25T16:00:00Z', user: 'Admin User', action: 'Claim C002 approved' },
    ],
  },
  {
    id: 'C003',
    policyId: 'P103',
    policyholder: 'Charlie Chaplin',
    type: 'Medical Emergency',
    description: 'Hospitalization for acute appendicitis.',
    submissionDate: '2023-10-15',
    status: 'REJECTED',
    amountRequested: 8000.00,
    documents: ['Medical Report.pdf'],
    assignedTo: 'John Doe (Claims Officer)',
    lastUpdate: '2023-10-22',
    workflow: [
      { stage: 'Submission', date: '2023-10-15', by: 'Charlie Chaplin', status: 'completed', slaBreach: false },
      { stage: 'Verification', date: '2023-10-16', by: 'System', status: 'completed', slaBreach: false },
      { stage: 'Review', date: '2023-10-18', by: 'John Doe (Claims Officer)', status: 'completed', slaBreach: true }, // SLA breach
      { stage: 'Approval', date: '2023-10-22', by: 'Admin User', status: 'completed', slaBreach: false },
      { stage: 'Settlement', date: null, by: null, status: 'skipped', slaBreach: false },
    ],
    auditLogs: [
      { timestamp: '2023-10-15T09:00:00Z', user: 'Charlie Chaplin', action: 'Claim C003 submitted' },
      { timestamp: '2023-10-16T10:00:00Z', user: 'System', action: 'Initial verification for C003' },
      { timestamp: '2023-10-18T14:00:00Z', user: 'John Doe', action: 'Claim C003 moved to review (SLA breached)' },
      { timestamp: '2023-10-22T11:00:00Z', user: 'Admin User', action: 'Claim C003 rejected: Policy exclusions' },
    ],
  },
  {
    id: 'C004',
    policyId: 'P104',
    policyholder: 'Diana Prince',
    type: 'Property Theft',
    description: 'Theft of electronics from apartment.',
    submissionDate: '2023-09-10',
    status: 'SETTLED',
    amountRequested: 3000.00,
    amountSettled: 2800.00,
    documents: ['Police Report.pdf'],
    assignedTo: 'Jane Smith (Claims Officer)',
    lastUpdate: '2023-09-28',
    workflow: [
      { stage: 'Submission', date: '2023-09-10', by: 'Diana Prince', status: 'completed', slaBreach: false },
      { stage: 'Verification', date: '2023-09-12', by: 'Mike V (Verification Officer)', status: 'completed', slaBreach: false },
      { stage: 'Review', date: '2023-09-15', by: 'Jane Smith (Claims Officer)', status: 'completed', slaBreach: false },
      { stage: 'Approval', date: '2023-09-20', by: 'Admin User', status: 'completed', slaBreach: false },
      { stage: 'Settlement', date: '2023-09-28', by: 'Finance Team', status: 'completed', slaBreach: false },
    ],
    auditLogs: [
      { timestamp: '2023-09-10T10:00:00Z', user: 'Diana Prince', action: 'Claim C004 submitted' },
      { timestamp: '2023-09-28T10:00:00Z', user: 'Finance Team', action: 'Claim C004 settled for $2800.00' },
    ],
  },
  {
    id: 'C005',
    policyId: 'P105',
    policyholder: 'Eve Adams',
    type: 'Travel Cancellation',
    description: 'Flight cancelled due to airline issues.',
    submissionDate: '2023-11-01',
    status: 'SUBMITTED',
    amountRequested: 800.00,
    documents: ['Flight Ticket.pdf', 'Cancellation Notice.pdf'],
    assignedTo: null,
    lastUpdate: '2023-11-01',
    workflow: [
      { stage: 'Submission', date: '2023-11-01', by: 'Eve Adams', status: 'completed', slaBreach: false },
      { stage: 'Verification', date: null, by: null, status: 'pending', slaBreach: false },
      { stage: 'Review', date: null, by: null, status: 'pending', slaBreach: false },
      { stage: 'Approval', date: null, by: null, status: 'pending', slaBreach: false },
      { stage: 'Settlement', date: null, by: null, status: 'pending', slaBreach: false },
    ],
    auditLogs: [
      { timestamp: '2023-11-01T08:00:00Z', user: 'Eve Adams', action: 'Claim C005 submitted' },
    ],
  },
];

const POLICIES_DATA = [
  {
    id: 'P101',
    policyholder: 'Alice Wonderland',
    type: 'Auto Insurance',
    startDate: '2023-01-01',
    endDate: '2024-01-01',
    status: 'ACTIVE',
    premium: 1200.00,
    coverage: ['Collision', 'Liability', 'Comprehensive'],
  },
  {
    id: 'P102',
    policyholder: 'Bob The Builder',
    type: 'Homeowner Insurance',
    startDate: '2022-06-15',
    endDate: '2023-06-15',
    status: 'EXPIRED',
    premium: 950.00,
    coverage: ['Dwelling', 'Personal Property', 'Liability'],
  },
  {
    id: 'P103',
    policyholder: 'Charlie Chaplin',
    type: 'Health Insurance',
    startDate: '2023-03-01',
    endDate: '2024-03-01',
    status: 'ACTIVE',
    premium: 2500.00,
    coverage: ['Hospitalization', 'Outpatient', 'Prescription'],
  },
  {
    id: 'P104',
    policyholder: 'Diana Prince',
    type: 'Renters Insurance',
    startDate: '2023-02-01',
    endDate: '2024-02-01',
    status: 'ACTIVE',
    premium: 300.00,
    coverage: ['Personal Property', 'Liability'],
  },
  {
    id: 'P105',
    policyholder: 'Eve Adams',
    type: 'Travel Insurance',
    startDate: '2023-10-30',
    endDate: '2023-11-15',
    status: 'ACTIVE',
    premium: 150.00,
    coverage: ['Trip Cancellation', 'Medical Emergency'],
  },
  {
    id: 'P106',
    policyholder: 'Frankenstein',
    type: 'Life Insurance',
    startDate: '2020-01-01',
    endDate: '2040-01-01',
    status: 'ACTIVE',
    premium: 500.00,
    coverage: ['Term Life'],
  },
];

const RECENT_ACTIVITIES_DATA = [
  { id: 'RA1', type: 'Claim Update', description: 'Claim C001 status changed to Pending Verification.', timestamp: '2023-10-27T11:30:00Z', relatedId: 'C001', relatedType: 'CLAIM' },
  { id: 'RA2', type: 'Policy Renewed', description: 'Policy P102 was renewed for another year.', timestamp: '2023-10-26T09:00:00Z', relatedId: 'P102', relatedType: 'POLICY' },
  { id: 'RA3', type: 'Claim Submission', description: 'New claim C005 submitted by Eve Adams.', timestamp: '2023-11-01T08:00:00Z', relatedId: 'C005', relatedType: 'CLAIM' },
  { id: 'RA4', type: 'Claim Approved', description: 'Claim C002 approved for settlement.', timestamp: '2023-10-25T16:00:00Z', relatedId: 'C002', relatedType: 'CLAIM' },
  { id: 'RA5', type: 'User Login', description: 'Admin user logged in.', timestamp: '2023-11-02T09:00:00Z', relatedId: null, relatedType: null },
];

function App() {
  const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
  // Simulating a logged-in user, can be changed to test different roles
  const [currentUser, setCurrentUser] = useState({ id: 'admin1', name: 'Admin User', role: ROLES.ADMIN });
  const [claims, setClaims] = useState(CLAIMS_DATA);
  const [policies, setPolicies] = useState(POLICIES_DATA);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  const navigate = (screen, params = {}) => {
    setView({ screen, params });
    setShowGlobalSearch(false); // Close search overlay on navigation
  };

  const handleLogout = () => {
    // In a real app, this would clear authentication tokens and redirect to login
    setCurrentUser(null);
    navigate('LOGIN');
  };

  const canAccess = (requiredRoles) => {
    if (!currentUser) return false;
    return requiredRoles.includes(currentUser.role);
  };

  const Breadcrumbs = ({ currentScreen, params }) => {
    const crumbs = [{ label: 'Home', screen: 'DASHBOARD' }];

    switch (currentScreen) {
      case 'DASHBOARD':
        break;
      case 'CLAIMS_LIST':
        crumbs.push({ label: 'Claims', screen: 'CLAIMS_LIST' });
        break;
      case 'CLAIM_DETAIL':
        crumbs.push({ label: 'Claims', screen: 'CLAIMS_LIST' });
        crumbs.push({ label: `Claim ${params?.id}`, screen: 'CLAIM_DETAIL', params });
        break;
      case 'POLICIES_LIST':
        crumbs.push({ label: 'Policies', screen: 'POLICIES_LIST' });
        break;
      case 'POLICY_DETAIL':
        crumbs.push({ label: 'Policies', screen: 'POLICIES_LIST' });
        crumbs.push({ label: `Policy ${params?.id}`, screen: 'POLICY_DETAIL', params });
        break;
      case 'SETTINGS':
        crumbs.push({ label: 'Settings', screen: 'SETTINGS' });
        break;
      case 'PROFILE':
        crumbs.push({ label: 'Profile', screen: 'PROFILE' });
        break;
      case 'LOGIN':
        crumbs.push({ label: 'Login', screen: 'LOGIN' });
        break;
      default:
        break;
    }

    return (
      <div className="breadcrumbs">
        {crumbs.map((crumb, index) => (
          <React.Fragment key={crumb.label}>
            <a onClick={() => navigate(crumb.screen, crumb.params)}>
              {crumb.label}
            </a>
            {index < crumbs.length - 1 && <span> / </span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // --- Components for different views ---

  const Dashboard = () => {
    const totalClaims = claims.length;
    const approvedClaims = claims.filter(c => c.status === 'APPROVED').length;
    const pendingClaims = claims.filter(c => c.status === 'PENDING_VERIFICATION' || c.status === 'IN_REVIEW').length;
    const settledClaims = claims.filter(c => c.status === 'SETTLED').length;

    return (
      <div className="container page-content">
        <h2>Dashboard</h2>

        {canAccess([ROLES.ADMIN, ROLES.CLAIMS_OFFICER, ROLES.VERIFICATION_OFFICER, ROLES.FINANCE_TEAM]) && (
          <>
            <div className="dashboard-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <div className="dashboard-card kpi-card">
                <div className="value">{totalClaims}</div>
                <div className="label">Total Claims</div>
              </div>
              <div className="dashboard-card kpi-card">
                <div className="value">{pendingClaims}</div>
                <div className="label">Pending Claims</div>
              </div>
              <div className="dashboard-card kpi-card">
                <div className="value">{approvedClaims}</div>
                <div className="label">Approved Claims</div>
              </div>
              <div className="dashboard-card kpi-card">
                <div className="value">{settledClaims}</div>
                <div className="label">Settled Claims</div>
              </div>
            </div>

            <div className="dashboard-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <div className="dashboard-card">
                <h3>Claim Status Distribution (Donut Chart)</h3>
                <div className="chart-placeholder">Placeholder for Donut Chart</div>
              </div>
              <div className="dashboard-card">
                <h3>Claim Processing Time (Bar Chart)</h3>
                <div className="chart-placeholder">Placeholder for Bar Chart</div>
              </div>
            </div>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Recent Activities</h3>
                <div className="recent-activities">
                  <ul>
                    {RECENT_ACTIVITIES_DATA.map(activity => (
                      <li key={activity.id}>
                        {activity.description}
                        <div className="activity-meta">
                          {new Date(activity.timestamp).toLocaleString()}
                          {activity.relatedType === 'CLAIM' && activity.relatedId && (
                            <span style={{ marginLeft: 'var(--spacing-xs)' }}>
                              <button
                                className="btn-link"
                                onClick={() => navigate('CLAIM_DETAIL', { id: activity.relatedId })}
                              >
                                View Claim {activity.relatedId}
                              </button>
                            </span>
                          )}
                           {activity.relatedType === 'POLICY' && activity.relatedId && (
                            <span style={{ marginLeft: 'var(--spacing-xs)' }}>
                              <button
                                className="btn-link"
                                onClick={() => navigate('POLICY_DETAIL', { id: activity.relatedId })}
                              >
                                View Policy {activity.relatedId}
                              </button>
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="dashboard-card">
                <h3>SLA Performance (Gauge Chart)</h3>
                <div className="chart-placeholder">Placeholder for Gauge Chart</div>
              </div>
            </div>
          </>
        )}

        {canAccess([ROLES.POLICYHOLDER]) && (
          <div className="dashboard-card">
            <h3>My Recent Claims</h3>
            <div className="grid">
              {claims
                .filter(c => c.policyholder === currentUser.name)
                .slice(0, 3)
                .map(claim => (
                  <ClaimCard key={claim.id} claim={claim} navigate={navigate} />
                ))}
            </div>
            {claims.filter(c => c.policyholder === currentUser.name).length === 0 && (
                <p>No claims submitted yet. <button className="btn-link" onClick={() => alert('Feature: Claim Submission Form')}>Submit a new claim</button>.</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const ClaimCard = ({ claim }) => {
    const statusInfo = STATUS_MAP.CLAIM[claim.status] || { label: claim.status, color: 'var(--color-secondary)' };
    const latestWorkflowStage = claim.workflow?.[(claim.workflow.findIndex(s => s.status === 'active' || s.status === 'pending') === -1) ? (claim.workflow.length - 1) : (claim.workflow.findIndex(s => s.status === 'active' || s.status === 'pending') -1)];
    const slaBreach = latestWorkflowStage?.slaBreach;

    return (
      <div
        className="card"
        style={{ borderColor: statusInfo.color }}
        onClick={() => navigate('CLAIM_DETAIL', { id: claim.id })}
      >
        <h4 className="card-title">{claim.type} ({claim.id})</h4>
        <p className="card-subtitle">Policy: {claim.policyId}</p>
        <div className="card-content">
          <p><strong>Policyholder:</strong> {claim.policyholder}</p>
          <p><strong>Requested:</strong> ${claim.amountRequested?.toFixed(2)}</p>
        </div>
        <div className="card-footer">
          <span className={`status-badge ${claim.status?.toLowerCase().replace(/_/g, '-')}`} style={{ backgroundColor: statusInfo.color }}>
            {statusInfo.label}
          </span>
          {slaBreach && (
            <span style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
              SLA Breached!
            </span>
          )}
        </div>
      </div>
    );
  };

  const ClaimsList = () => {
    // Placeholder for search, filter, sort
    const filteredClaims = claims.filter(c =>
      (c.id?.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
       c.policyholder?.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
       c.type?.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
       c.status?.toLowerCase().includes(globalSearchTerm.toLowerCase()))
    );

    return (
      <div className="container page-content">
        <div className="detail-header">
            <h2>Claims List</h2>
            {canAccess([ROLES.CLAIMS_OFFICER, ROLES.ADMIN]) && (
                <div className="detail-actions">
                    <button className="btn-primary" onClick={() => alert('Feature: Add New Claim Form')}>+ New Claim</button>
                    <button className="btn-outline-primary" onClick={() => alert('Feature: Bulk Approve Selected Claims')}>Bulk Actions</button>
                </div>
            )}
        </div>
        {(filteredClaims.length === 0) ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xxl)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--border-radius-md)' }}>
                <h3>No Claims Found</h3>
                <p style={{ color: 'var(--color-muted)' }}>It looks like there are no claims matching your criteria. Try adjusting your search or filters.</p>
                {canAccess([ROLES.CLAIMS_OFFICER, ROLES.ADMIN]) && (
                  <button className="btn-primary" style={{ marginTop: 'var(--spacing-md)' }} onClick={() => alert('Feature: Add New Claim Form')}>Submit First Claim</button>
                )}
            </div>
        ) : (
            <div className="grid">
            {filteredClaims.map((claim) => (
                <ClaimCard key={claim.id} claim={claim} navigate={navigate} />
            ))}
            </div>
        )}
      </div>
    );
  };

  const ClaimDetail = () => {
    const claimId = view.params?.id;
    const claim = claims.find(c => c.id === claimId);

    if (!claim) {
      return (
        <div className="container page-content">
          <h2>Claim Not Found</h2>
          <p>The claim with ID "{claimId}" does not exist.</p>
          <button className="btn-primary" onClick={() => navigate('CLAIMS_LIST')}>Back to Claims</button>
        </div>
      );
    }

    const statusInfo = STATUS_MAP.CLAIM[claim.status] || { label: claim.status, color: 'var(--color-secondary)' };

    const handleApprove = () => {
      // Functional update to ensure state immutability
      setClaims(prevClaims =>
        prevClaims.map(c =>
          c.id === claim.id
            ? {
                ...c,
                status: 'APPROVED',
                workflow: c.workflow.map(stage => (
                  stage.status === 'active' ? { ...stage, status: 'completed', date: new Date().toISOString().slice(0, 10), by: currentUser?.name || 'System' } : stage
                )).concat((claim.workflow.some(s => s.stage === 'Approval')) ? [] : [{ stage: 'Approval', date: new Date().toISOString().slice(0, 10), by: currentUser?.name || 'System', status: 'completed', slaBreach: false }])
                // Simplified workflow update, a real system would be more complex
              }
            : c
        )
      );
      alert(`Claim ${claim.id} Approved!`);
      navigate('CLAIM_DETAIL', { id: claim.id }); // Refresh view
    };

    const handleReject = () => {
      setClaims(prevClaims =>
        prevClaims.map(c =>
          c.id === claim.id
            ? {
                ...c,
                status: 'REJECTED',
                workflow: c.workflow.map(stage => (
                    stage.status === 'active' ? { ...stage, status: 'completed', date: new Date().toISOString().slice(0, 10), by: currentUser?.name || 'System' } : stage
                )).concat((claim.workflow.some(s => s.stage === 'Approval')) ? [] : [{ stage: 'Approval', date: new Date().toISOString().slice(0, 10), by: currentUser?.name || 'System', status: 'completed', slaBreach: false }])
              }
            : c
        )
      );
      alert(`Claim ${claim.id} Rejected.`);
      navigate('CLAIM_DETAIL', { id: claim.id });
    };

    const handleSettle = () => {
      setClaims(prevClaims =>
        prevClaims.map(c =>
          c.id === claim.id
            ? {
                ...c,
                status: 'SETTLED',
                workflow: c.workflow.map(stage => (
                    stage.status === 'active' ? { ...stage, status: 'completed', date: new Date().toISOString().slice(0, 10), by: currentUser?.name || 'System' } : stage
                )).concat((claim.workflow.some(s => s.stage === 'Settlement')) ? [] : [{ stage: 'Settlement', date: new Date().toISOString().slice(0, 10), by: currentUser?.name || 'System', status: 'completed', slaBreach: false }])
              }
            : c
        )
      );
      alert(`Claim ${claim.id} Settled.`);
      navigate('CLAIM_DETAIL', { id: claim.id });
    };

    return (
      <div className="container page-content">
        <div className="detail-header">
          <h1>Claim Details: {claim.id}</h1>
          <div className="detail-actions">
            {canAccess([ROLES.CLAIMS_OFFICER, ROLES.ADMIN]) && (
              <>
                {(claim.status === 'PENDING_VERIFICATION' || claim.status === 'IN_REVIEW') && (
                  <button className="btn-primary" onClick={handleApprove}>Approve Claim</button>
                )}
                {(claim.status === 'PENDING_VERIFICATION' || claim.status === 'IN_REVIEW') && (
                  <button className="btn-secondary" onClick={handleReject}>Reject Claim</button>
                )}
                {((claim.status === 'APPROVED' || claim.status === 'IN_REVIEW' || claim.status === 'PENDING_VERIFICATION') && canAccess([ROLES.FINANCE_TEAM, ROLES.ADMIN])) && (
                  <button className="btn-primary" onClick={handleSettle}>Settle Claim</button>
                )}
                <button className="btn-outline-primary" onClick={() => alert('Feature: Edit Claim Form')}>Edit</button>
              </>
            )}
            <button className="btn-secondary" onClick={() => navigate('CLAIMS_LIST')}>Back to List</button>
          </div>
        </div>

        <div className="detail-sections">
          <div>
            <div className="detail-section">
              <h3>Claim Information</h3>
              <div className="detail-item"><strong>ID:</strong><span>{claim.id}</span></div>
              <div className="detail-item"><strong>Policy ID:</strong><button className="btn-link" onClick={() => navigate('POLICY_DETAIL', { id: claim.policyId })}>{claim.policyId}</button></div>
              <div className="detail-item"><strong>Policyholder:</strong><span>{claim.policyholder}</span></div>
              <div className="detail-item"><strong>Type:</strong><span>{claim.type}</span></div>
              <div className="detail-item"><strong>Description:</strong><span>{claim.description}</span></div>
              <div className="detail-item"><strong>Submission Date:</strong><span>{claim.submissionDate}</span></div>
              <div className="detail-item"><strong>Amount Requested:</strong><span>${claim.amountRequested?.toFixed(2)}</span></div>
              {claim.amountSettled && (
                <div className="detail-item"><strong>Amount Settled:</strong><span>${claim.amountSettled?.toFixed(2)}</span></div>
              )}
              <div className="detail-item"><strong>Current Status:</strong>
                <span className={`status-badge ${claim.status?.toLowerCase().replace(/_/g, '-')}`} style={{ backgroundColor: statusInfo.color }}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="detail-item"><strong>Assigned To:</strong><span>{claim.assignedTo || 'N/A'}</span></div>
              <div className="detail-item"><strong>Last Update:</strong><span>{claim.lastUpdate}</span></div>
            </div>

            <div className="detail-section">
              <h3>Workflow Tracker</h3>
              <div className="workflow-tracker">
                {claim.workflow?.map((stage, index) => (
                  <div
                    key={index}
                    className={`workflow-stage ${stage.status} ${stage.slaBreach ? 'sla-breach' : ''}`}
                  >
                    <div className="workflow-stage-icon">
                      {stage.status === 'completed' ? '✓' : (stage.status === 'active' ? '●' : '○')}
                    </div>
                    <div className="workflow-stage-label">{stage.stage}</div>
                    {stage.date && <div className="workflow-stage-date">{stage.date}</div>}
                    {stage.by && <div className="workflow-stage-date">by {stage.by}</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-section">
                <h3>Supporting Documents</h3>
                {(claim.documents?.length === 0) ? (
                    <p>No documents uploaded.</p>
                ) : (
                    <ul>
                    {claim.documents?.map((doc, index) => (
                        <li key={index} style={{ marginBottom: 'var(--spacing-xs)' }}>
                        <a href="#" onClick={(e) => { e.preventDefault(); alert(`Feature: Document preview for ${doc}`); }}>{doc}</a>
                        </li>
                    ))}
                    </ul>
                )}
            </div>

          </div>

          <div>
            <div className="detail-section">
              <h3>Audit Logs</h3>
              {(canAccess([ROLES.ADMIN, ROLES.CLAIMS_OFFICER])) ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <ul>
                    {claim.auditLogs?.map((log, index) => (
                      <li key={index} style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-xs)', borderBottom: '1px dotted var(--color-border)', paddingBottom: 'var(--spacing-xs)' }}>
                        <strong>{new Date(log.timestamp).toLocaleString()}:</strong> {log.action} (by {log.user})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p style={{ color: 'var(--color-muted)' }}>You do not have permission to view audit logs.</p>
              )}
            </div>

            <div className="detail-section">
              <h3>Related Records</h3>
              <p>No related policies or claims found.</p>
              <button className="btn-link" onClick={() => alert('Feature: Link new record')}>Link New Record</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PolicyCard = ({ policy }) => {
    const statusInfo = STATUS_MAP.POLICY[policy.status] || { label: policy.status, color: 'var(--color-secondary)' };
    return (
      <div
        className="card"
        style={{ borderColor: statusInfo.color }}
        onClick={() => navigate('POLICY_DETAIL', { id: policy.id })}
      >
        <h4 className="card-title">{policy.type} ({policy.id})</h4>
        <p className="card-subtitle">Holder: {policy.policyholder}</p>
        <div className="card-content">
          <p><strong>Coverage:</strong> {policy.coverage?.join(', ')}</p>
          <p><strong>Period:</strong> {policy.startDate} to {policy.endDate}</p>
        </div>
        <div className="card-footer">
          <span className={`status-badge ${policy.status?.toLowerCase().replace(/_/g, '-')}`} style={{ backgroundColor: statusInfo.color }}>
            {statusInfo.label}
          </span>
        </div>
      </div>
    );
  };

  const PoliciesList = () => {
    // Placeholder for search, filter, sort
    const filteredPolicies = policies.filter(p =>
      (p.id?.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
       p.policyholder?.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
       p.type?.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
       p.status?.toLowerCase().includes(globalSearchTerm.toLowerCase()))
    );

    return (
      <div className="container page-content">
        <div className="detail-header">
            <h2>Policies List</h2>
            {canAccess([ROLES.CLAIMS_OFFICER, ROLES.ADMIN]) && (
                <div className="detail-actions">
                    <button className="btn-primary" onClick={() => alert('Feature: Add New Policy Form')}>+ New Policy</button>
                </div>
            )}
        </div>
        {(filteredPolicies.length === 0) ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xxl)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--border-radius-md)' }}>
                <h3>No Policies Found</h3>
                <p style={{ color: 'var(--color-muted)' }}>It looks like there are no policies matching your criteria. Try adjusting your search or filters.</p>
                {canAccess([ROLES.CLAIMS_OFFICER, ROLES.ADMIN]) && (
                  <button className="btn-primary" style={{ marginTop: 'var(--spacing-md)' }} onClick={() => alert('Feature: Add New Policy Form')}>Create First Policy</button>
                )}
            </div>
        ) : (
            <div className="grid">
                {filteredPolicies.map((policy) => (
                    <PolicyCard key={policy.id} policy={policy} navigate={navigate} />
                ))}
            </div>
        )}
      </div>
    );
  };

  const PolicyDetail = () => {
    const policyId = view.params?.id;
    const policy = policies.find(p => p.id === policyId);

    if (!policy) {
      return (
        <div className="container page-content">
          <h2>Policy Not Found</h2>
          <p>The policy with ID "{policyId}" does not exist.</p>
          <button className="btn-primary" onClick={() => navigate('POLICIES_LIST')}>Back to Policies</button>
        </div>
      );
    }

    const statusInfo = STATUS_MAP.POLICY[policy.status] || { label: policy.status, color: 'var(--color-secondary)' };
    const relatedClaims = claims.filter(c => c.policyId === policy.id);

    return (
      <div className="container page-content">
        <div className="detail-header">
          <h1>Policy Details: {policy.id}</h1>
          <div className="detail-actions">
            {canAccess([ROLES.CLAIMS_OFFICER, ROLES.ADMIN]) && (
              <button className="btn-outline-primary" onClick={() => alert('Feature: Edit Policy Form')}>Edit</button>
            )}
            <button className="btn-secondary" onClick={() => navigate('POLICIES_LIST')}>Back to List</button>
          </div>
        </div>

        <div className="detail-sections">
          <div>
            <div className="detail-section">
              <h3>Policy Information</h3>
              <div className="detail-item"><strong>ID:</strong><span>{policy.id}</span></div>
              <div className="detail-item"><strong>Policyholder:</strong><span>{policy.policyholder}</span></div>
              <div className="detail-item"><strong>Type:</strong><span>{policy.type}</span></div>
              <div className="detail-item"><strong>Start Date:</strong><span>{policy.startDate}</span></div>
              <div className="detail-item"><strong>End Date:</strong><span>{policy.endDate}</span></div>
              <div className="detail-item"><strong>Status:</strong>
                <span className={`status-badge ${policy.status?.toLowerCase().replace(/_/g, '-')}`} style={{ backgroundColor: statusInfo.color }}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="detail-item"><strong>Premium:</strong><span>${policy.premium?.toFixed(2)} / year</span></div>
              <div className="detail-item"><strong>Coverage:</strong><span>{policy.coverage?.join(', ')}</span></div>
            </div>
          </div>
          <div>
            <div className="detail-section">
              <h3>Related Claims</h3>
              {(relatedClaims.length === 0) ? (
                <p>No claims found for this policy.</p>
              ) : (
                <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
                  {relatedClaims.map(claim => (
                    <ClaimCard key={claim.id} claim={claim} navigate={navigate} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Settings = () => (
    <div className="container page-content">
      <h2>Settings</h2>
      <div className="detail-section">
        <h3>User Preferences</h3>
        <p>Manage your notification settings, theme, and language preferences.</p>
        <button className="btn-primary" onClick={() => alert('Feature: Save Preferences')}>Save Preferences</button>
      </div>
      {canAccess([ROLES.ADMIN]) && (
        <div className="detail-section">
          <h3>Platform Configuration</h3>
          <p>Configure system-wide settings, user roles, and integrations.</p>
          <button className="btn-primary" onClick={() => alert('Feature: Admin Configuration')}>Go to Admin Config</button>
        </div>
      )}
    </div>
  );

  const Profile = () => (
    <div className="container page-content">
      <h2>My Profile</h2>
      <div className="detail-section">
        <h3>User Information</h3>
        <p><strong>Name:</strong> {currentUser?.name}</p>
        <p><strong>Role:</strong> {currentUser?.role}</p>
        <p><strong>Email:</strong> {currentUser?.name?.toLowerCase().replace(' ', '.') || 'user'}@example.com</p>
        <button className="btn-primary" onClick={() => alert('Feature: Edit Profile')}>Edit Profile</button>
      </div>
    </div>
  );

  const Login = () => (
    <div className="container page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="detail-section" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h2>Login</h2>
        <form onSubmit={(e) => { e.preventDefault(); setCurrentUser({ id: 'admin1', name: 'Admin User', role: ROLES.ADMIN }); navigate('DASHBOARD'); }}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" defaultValue="admin" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" defaultValue="password" required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: 'var(--spacing-sm)' }}>Login</button>
        </form>
        <p style={{ marginTop: 'var(--spacing-md)' }}>
          Try logging in as: <button className="btn-link" onClick={() => setCurrentUser({ id: 'po1', name: 'Alice Wonderland', role: ROLES.POLICYHOLDER })}>Policyholder</button> |
          <button className="btn-link" onClick={() => setCurrentUser({ id: 'co1', name: 'John Doe', role: ROLES.CLAIMS_OFFICER })}>Claims Officer</button> |
          <button className="btn-link" onClick={() => setCurrentUser({ id: 'vo1', name: 'Mike V', role: ROLES.VERIFICATION_OFFICER })}>Verification Officer</button> |
          <button className="btn-link" onClick={() => setCurrentUser({ id: 'ft1', name: 'Sarah F', role: ROLES.FINANCE_TEAM })}>Finance Team</button> |
          <button className="btn-link" onClick={() => setCurrentUser({ id: 'admin1', name: 'Admin User', role: ROLES.ADMIN })}>Admin</button>
        </p>
      </div>
    </div>
  );

  const GlobalSearchOverlay = () => {
    if (!showGlobalSearch) return null;

    const allSearchableItems = [
      ...claims.map(c => ({
        id: `claim-${c.id}`,
        label: `Claim ${c.id}: ${c.type} (${c.policyholder}) - ${c.status}`,
        type: 'CLAIM',
        targetId: c.id,
      })),
      ...policies.map(p => ({
        id: `policy-${p.id}`,
        label: `Policy ${p.id}: ${p.type} (${p.policyholder}) - ${p.status}`,
        type: 'POLICY',
        targetId: p.id,
      })),
      { id: 'dash', label: 'Dashboard Overview', type: 'SCREEN', targetId: 'DASHBOARD' },
      { id: 'claimlist', label: 'All Claims List', type: 'SCREEN', targetId: 'CLAIMS_LIST' },
      { id: 'policylist', label: 'All Policies List', type: 'SCREEN', targetId: 'POLICIES_LIST' },
      { id: 'settings', label: 'Settings', type: 'SCREEN', targetId: 'SETTINGS' },
      { id: 'profile', label: 'My Profile', type: 'SCREEN', targetId: 'PROFILE' },
    ];

    const filteredResults = globalSearchTerm
      ? allSearchableItems.filter(item =>
          item.label.toLowerCase().includes(globalSearchTerm.toLowerCase())
        )
      : [];

    const handleResultClick = (item) => {
        if (item.type === 'CLAIM') {
            navigate('CLAIM_DETAIL', { id: item.targetId });
        } else if (item.type === 'POLICY') {
            navigate('POLICY_DETAIL', { id: item.targetId });
        } else if (item.type === 'SCREEN') {
            navigate(item.targetId);
        }
        setGlobalSearchTerm('');
        setShowGlobalSearch(false);
    };

    return (
      <div className="global-search-overlay" onClick={() => setShowGlobalSearch(false)}>
        <div className="global-search-content" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            placeholder="Search claims, policies, or navigate..."
            value={globalSearchTerm}
            onChange={(e) => setGlobalSearchTerm(e.target.value)}
            autoFocus
          />
          {filteredResults.length > 0 && (
            <div className="global-search-results">
              {filteredResults.map(item => (
                <div key={item.id} onClick={() => handleResultClick(item)}>
                  {item.label}
                </div>
              ))}
            </div>
          )}
          {globalSearchTerm && filteredResults.length === 0 && (
            <div className="global-search-results" style={{ textAlign: 'center', color: 'var(--color-muted)' }}>
                No results found for "{globalSearchTerm}"
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render the appropriate screen based on `view.screen`
  const renderScreen = () => {
    if (!currentUser && view.screen !== 'LOGIN') {
        return <Login />;
    }
    switch (view.screen) {
      case 'DASHBOARD':
        return <Dashboard />;
      case 'CLAIMS_LIST':
        return <ClaimsList />;
      case 'CLAIM_DETAIL':
        return <ClaimDetail />;
      case 'POLICIES_LIST':
        return <PoliciesList />;
      case 'POLICY_DETAIL':
        return <PolicyDetail />;
      case 'SETTINGS':
        return <Settings />;
      case 'PROFILE':
        return <Profile />;
      case 'LOGIN':
        return <Login />;
      default:
        return <Dashboard />; // Fallback
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="logo" onClick={() => navigate('DASHBOARD')} style={{ cursor: 'pointer' }}>
          ClaimPro
        </div>
        {currentUser && (
          <nav className="app-nav">
            <a
              className={view.screen === 'DASHBOARD' ? 'active' : ''}
              onClick={() => navigate('DASHBOARD')}
            >
              Dashboard
            </a>
            {canAccess([ROLES.ADMIN, ROLES.CLAIMS_OFFICER, ROLES.VERIFICATION_OFFICER, ROLES.POLICYHOLDER, ROLES.FINANCE_TEAM]) && (
              <a
                className={view.screen.startsWith('CLAIM') ? 'active' : ''}
                onClick={() => navigate('CLAIMS_LIST')}
              >
                Claims
              </a>
            )}
            {canAccess([ROLES.ADMIN, ROLES.CLAIMS_OFFICER, ROLES.POLICYHOLDER]) && (
              <a
                className={view.screen.startsWith('POLICY') ? 'active' : ''}
                onClick={() => navigate('POLICIES_LIST')}
              >
                Policies
              </a>
            )}
            {canAccess([ROLES.ADMIN, ROLES.FINANCE_TEAM]) && (
                <a onClick={() => alert('Feature: Finance Section')}>Finance</a>
            )}
            {canAccess([ROLES.ADMIN]) && (
              <a
                className={view.screen === 'SETTINGS' ? 'active' : ''}
                onClick={() => navigate('SETTINGS')}
              >
                Settings
              </a>
            )}
          </nav>
        )}
        {currentUser ? (
          <div className="user-controls">
            <button className="btn-secondary" onClick={() => setShowGlobalSearch(true)}>Search</button>
            <button className="btn-link" onClick={() => navigate('PROFILE')}>
              {currentUser.name} ({currentUser.role})
            </button>
            <button className="btn-outline-primary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
            <div className="user-controls">
                <button className="btn-primary" onClick={() => navigate('LOGIN')}>Login</button>
            </div>
        )}
      </header>

      {currentUser && <Breadcrumbs currentScreen={view.screen} params={view.params} />}

      {renderScreen()}

      <GlobalSearchOverlay />
    </div>
  );
}

export default App;