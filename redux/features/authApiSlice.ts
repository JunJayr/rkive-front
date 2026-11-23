import { apiSlice } from '../services/apiSlice';

interface Faculty {
	facultyID: number;
	name: string;
	title?: string | null;
	department?: string | null;
	user?: number | string | null;
	user_email?: string | null;
	user_name?: string | null;
}

export type AccountType =
  | 'superadmin'
  | 'admin'
  | 'department_head'
  | 'faculty'
  | 'student'
  | 'panel'
  | 'user';

export function normalizeAccountType(value?: string | null): Exclude<AccountType, 'panel' | 'user'> {
  const v = (value || '').toLowerCase();
  if (v === 'panel') return 'faculty';
  if (v === 'user') return 'student';
  if (v === 'superadmin' || v === 'admin' || v === 'department_head' || v === 'faculty' || v === 'student') return v;
  return 'student';
}

interface User {
  userID: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_dean: boolean;
  is_headdept: boolean;
  is_department_head?: boolean;
  department?: string;
  department_normalized?: string;
  is_faculty: boolean;
  is_student: boolean;
  account_type?: AccountType;
  is_admin?: boolean;
  is_panel?: boolean;
  is_superadmin?: boolean;
  is_research_admin?: boolean;
  can_manage_system?: boolean;
  can_administer_academics?: boolean;
}

interface ApplicationFormData {
  application_id?: number;
  proponents?: Proponent[];
  department: string;
  lead_researcher: string;
  lead_contactno: string;
  co_researcher1: string;
  co_researcher2: string;
  co_researcher3: string;
  co_researcher4: string;
  co_researcher5: string;
  research_title: string;
  datetime_defense: string;
  place_defense: string;
  adviser: number;
  panel_chair: number;
  panel1: number;
  panel2: number;
  panel3: number;
  documenter: string;
  [key: `co_researcher${number}`]: string;
  [key: `panel${number}`]: number;
}

export interface FacultyRosterEntry {
  role: string;
  label: string;
  faculty_id: number;
  name: string;
  title?: string;
}

export interface PanelNominationInput {
  department?: string;
  research_title?: string;
  lead_researcher?: string;
  lead_contactno?: string;
  proponents?: Proponent[];
  faculty_roster?: FacultyRosterEntry[];
  form_data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PanelNomination {
  nomination_id: number;
  id: number;
  panelID: number;
  stage: 'panel_nomination';
  stage_label: string;
  department: string;
  research_title: string;
  lead_researcher: string;
  lead_contactno: string;
  proponents: Proponent[];
  faculty_roster: FacultyRosterEntry[];
  form_data: Record<string, unknown>;
  status: ApplicationStatus;
  decision_reason: string;
  submitted_at?: string | null;
  approved_at?: string | null;
  attempt: number;
  created_at?: string | null;
  docx_file: string;
  pdf_file: string;
  submit_blockers: string[];
  reason: string;
  stage_gate: Pick<StageGate, 'stage' | 'satisfied' | 'missing' | 'message'>;
  reviews?: Array<{ review_id: number; reviewer: string; status: string; comments: string; reviewed_at?: string | null }>;
  already_submitted?: boolean;
}

interface RepositoryManuscript {
  manuscriptID: number;
  title: string;
  description: string;
  authors: string[];
  adviser?: string | null;
  panel_members: string[];
  department?: string | null;
  program?: string | null;
  year_completed?: number | null;
  keywords: string[];
  category?: string | null;
  status: 'pending' | 'under_review' | 'revision_required' | 'approved' | 'rejected';
  visibility: 'public' | 'institution' | 'restricted';
  allow_download: boolean;
  approved_at?: string | null;
  published_at?: string | null;
  view_count?: number;
  download_count?: number;
  is_bookmarked?: boolean;
}

interface DocumentCount {
  generated_documents_count: number;
  manuscripts_count: number;
  research_groups?: number;
  pending_reviews?: number;
  completed_defenses?: number;
  published_manuscripts?: number;
  stages?: { concept?: number; proposal?: number; final_defense?: number; manuscript?: number };
}

interface AddUserResponse {
  message: string;
  userID: string;
  first_name: string;
  last_name: string;
  email: string;
}
  
interface AddUserInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  repassword: string;
  account_type?: AccountType;
  department?: string;
  is_active?: boolean;
}

export type WorkflowStage = 'panel_nomination' | 'concept' | 'proposal' | 'final' | 'manuscript';
export type ApplicationStatus =
  | 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected' | 'revision_required';

export interface Proponent {
  name: string;
  email?: string;
  user?: number | string | null;
}

export interface PanelAssignment {
  assignment_id: number;
  faculty_id: number;
  name: string;
  position: string;
  position_label: string;
  slot: number;
  response: 'pending' | 'accepted' | 'declined';
  response_reason: string;
  responded_at?: string | null;
  is_active: boolean;
  is_correction: boolean;
  attempt: number;
  can_respond: boolean;
  superseded_by?: number | null;
}

export interface ApprovalRecord {
  approval_id: number;
  faculty_id: number;
  panelist: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_required';
  comments: string;
  reason: string;
  decided_at?: string | null;
  attempt: number;
  has_signature: boolean;
  signature_url?: string;
}

export interface DefenseSchedule {
  schedule_id: number;
  application_id: number;
  stage: string;
  stage_label: string;
  research_title: string;
  lead_researcher: string;
  group: string;
  date: string;
  start_time: string;
  end_time: string;
  venue_or_link: string;
  status: 'proposed' | 'confirmed' | 'cancelled';
  attempt: number;
  conflicts: ScheduleConflict[];
}

export interface ScheduleConflict {
  schedule_id: number;
  application_id: number;
  stage: string;
  stage_label: string;
  research_title: string;
  lead_researcher: string;
  group: string;
  date: string;
  start_time: string;
  end_time: string;
  venue_or_link: string;
  status: string;
  conflicting_panelists: string[];
}

export interface StageGate {
  stage: string;
  prerequisites: string[];
  completed: string[];
  satisfied: boolean;
  missing: string[];
  message: string;
}

export interface WorkflowApplication {
  application_id: number;
  id: number;
  stage: WorkflowStage;
  stage_label: string;
  department: string;
  research_title: string;
  lead_researcher: string;
  lead_contactno: string;
  proponents: Proponent[];
  form_data: Record<string, unknown>;
  faculty_roster: FacultyRosterEntry[];
  nomination_id?: number | null;
  roster_read_only: boolean;
  reason?: string;
  co_researcher1?: string;
  co_researcher2?: string;
  co_researcher3?: string;
  co_researcher4?: string;
  co_researcher5?: string;
  datetime_defense: string;
  place_defense: string;
  adviser?: string;
  documenter: string;
  adviser_id?: number | null;
  panel_chair_id?: number | null;
  panel1_id?: number | null;
  panel2_id?: number | null;
  panel3_id?: number | null;
  pdf_file: string;
  status: ApplicationStatus;
  decision_reason: string;
  submitted_at?: string | null;
  approved_at?: string | null;
  attempt: number;
  panel_locked: boolean;
  created_at?: string | null;
  panel: PanelAssignment[];
  panel_history: PanelAssignment[];
  panel_readiness: {
    count: number;
    distinct_count: number;
    accepted: string[];
    pending: string[];
    declined: string[];
    all_accepted: boolean;
  };
  stage_gate: StageGate;
  submit_blockers: string[];
  other_reviewers: [boolean, string];
  approvals?: ApprovalRecord[];
  reviews?: Array<{ review_id: number; reviewer: string; status: string; comments: string; reviewed_at?: string | null }>;
  schedule?: DefenseSchedule | null;
  form_url: string;
  permissions?: {
    can_view: boolean;
    can_edit: boolean;
    can_submit: boolean;
    can_assign_panels: boolean;
  };
}

export interface WorkflowStatus {
  account_type: AccountType;
  can_manage_system: boolean;
  can_manage_settings: boolean;
  can_assign_panels: boolean;
  stages: Array<{
    key: WorkflowStage;
    label: string;
    requires: WorkflowStage[];
    available: boolean;
    status: string;
    reason?: string;
    application_id?: number | null;
    nomination_id?: number | null;
  }>;
}

export interface PanelInvitation extends PanelAssignment {
  application: {
    application_id: number;
    stage: WorkflowStage;
    research_title: string;
    lead_researcher: string;
    department: string;
    status: ApplicationStatus;
    attempt: number;
  };
}

export interface NotificationItem {
  notification_id: number;
  category: string;
  title: string;
  message: string;
  link: string;
  metadata: Record<string, unknown>;
  is_read: boolean;
  created_at?: string | null;
}

export interface DepartmentRecord {
  department_id: number;
  name: string;
  code: string;
}

export interface OfficialTemplateRecord {
  code: string;
  name: string;
  form_number: string;
  revision: string;
  effective_date?: string | null;
  file?: string | null;
  is_active: boolean;
  updated_at?: string | null;
}

export interface ScheduleInput {
  date: string;
  start_time: string;
  end_time: string;
  venue_or_link: string;
  schedule_id?: number;
}

const authApiSlice = apiSlice.injectEndpoints({
	overrideExisting: true,
	endpoints: (builder) => ({
	  retrieveUser: builder.query<User, void>({
		query: () => '/users/me/',
	  }),
	  login: builder.mutation({
		query: ({ email, password }) => ({
		  url: '/jwt/create/',
		  method: 'POST',
		  body: { email, password },
		}),
	  }),
	  getUserRole: builder.mutation<
		{
		  account_type?: AccountType;
		  is_admin?: boolean;
		  is_panel?: boolean;
		  is_superadmin?: boolean;
		  is_research_admin?: boolean;
		  is_superuser: boolean;
		  is_staff: boolean;
		  is_active: boolean;
		  is_dean: boolean;
		  is_headdept: boolean;
		  is_department_head?: boolean;
		  is_faculty: boolean;
		  is_student: boolean;
		  faculty_id?: number | null;
		  department?: string;
		  department_normalized?: string;
		  can_manage_system?: boolean;
		  can_administer_academics?: boolean;
		  can_manage_settings?: boolean;
		  can_create_accounts?: boolean;
		  can_assign_panels?: boolean;
		},
		{}
	  >({
		query: () => ({
		  url: '/user-role/',
		  method: 'GET',
		}),
	  }),
	  register: builder.mutation({
		query: ({ first_name, last_name, email, password, re_password }) => ({
		  url: '/users/',
		  method: 'POST',
		  body: { first_name, last_name, email, password, re_password },
		}),
	  }),
	  verify: builder.mutation({
		query: (token: string) => ({
		  url: '/jwt/verify/',
		  method: 'POST',
		  body: { token },
		}),
	  }),
	  activation: builder.mutation({
		query: ({ uid, token }) => ({
		  url: '/users/activation/',
		  method: 'POST',
		  body: { uid, token },
		}),
	  }),
	  resetPassword: builder.mutation({
		query: (email) => ({
		  url: '/users/reset_password/',
		  method: 'POST',
		  body: { email },
		}),
	  }),
	  resetPasswordConfirm: builder.mutation({
		query: ({ uid, token, new_password, re_new_password }) => ({
		  url: '/users/reset_password_confirm/',
		  method: 'POST',
		  body: { uid, token, new_password, re_new_password },
		}),
	  }),
	  logout: builder.mutation({
		query: () => ({
		  url: '/logout/',
		  method: 'POST',
		}),
	  }),
	  
	  getFaculty: builder.query<Faculty[], void>({
		query: () => '/faculty/',
	  }),
	  getAdminFaculty: builder.query<Faculty[], void>({
		query: () => '/faculty/manage/',
	  }),
	  createFaculty: builder.mutation<Faculty, Partial<Faculty>>({
		query: (body) => ({ url: '/faculty/manage/', method: 'POST', body }),
	  }),
	  updateFaculty: builder.mutation<Faculty, { facultyID: number; data: Partial<Faculty> }>({
		query: ({ facultyID, data }) => ({ url: `/faculty/manage/${facultyID}/`, method: 'PATCH', body: data }),
	  }),
	  deleteFaculty: builder.mutation<{ message: string }, number>({
		query: (facultyID) => ({ url: `/faculty/manage/${facultyID}/`, method: 'DELETE' }),
	  }),
	  
	  // Forms Upload: Application and Panel Form
	  applicationGenerate: builder.mutation<string, ApplicationFormData>({
		query: (formData) => ({
		  url: '/application-docx/',
		  method: 'POST',
		  body: formData,
		  responseHandler: (response) => response.blob(), 
		}),
		transformResponse: (responseBlob: Blob) => {
		  return URL.createObjectURL(responseBlob);
		},
	  }),
	  proposalGenerate: builder.mutation<string, ApplicationFormData>({
		query: (formData) => ({
		  url: '/proposal-application-docx/',
		  method: 'POST',
		  body: formData,
		  responseHandler: (response) => response.blob(),
		}),
		transformResponse: (responseBlob: Blob) => {
		  return URL.createObjectURL(responseBlob);
		},
	  }),
	  finalGenerate: builder.mutation<string, ApplicationFormData>({
		query: (formData) => ({
		  url: '/final-application-docx/',
		  method: 'POST',
		  body: formData,
		  responseHandler: (response) => response.blob(),
		}),
		transformResponse: (responseBlob: Blob) => {
		  return URL.createObjectURL(responseBlob);
		},
	  }),
	  panelGenerate: builder.mutation<Blob, PanelNominationInput & { nomination_id?: number | null; submit?: boolean }>({
		query: (formData) => ({
		  url: '/panel-docx/',
		  method: 'POST',
		  body: formData,
		  responseHandler: async (response) => await response.blob(),
		}),
	  }),

	  adminUpdateApplicationTemplate: builder.mutation<Blob, { rev?: string; date?: string }>({
		query: (body) => ({
		  url: '/defense-application-admin/',
		  method: 'POST',
		  body,
		  responseHandler: async (response) => await response.blob(),
		}),
	  }),
	  adminUpdatePanelTemplate: builder.mutation<Blob, { rev?: string; date?: string }>({
		query: (body) => ({
		  url: '/defense-panel-admin/',
		  method: 'POST',
		  body,
		  responseHandler: async (response) => await response.blob(),
		}),
	  }),

	  // Manuscript Submission API
	  manuscriptSubmission: builder.mutation({
		query: (formData: FormData) => ({
		  url: '/manuscripts/',
		  method: 'POST',
		  body: formData,
		}),
	  }),
	  // Retrieve Manuscripts API
	  searchManuscripts: builder.query<
		RepositoryManuscript[] | { results: RepositoryManuscript[]; count: number; page: number; page_size: number; total_pages: number; has_next: boolean; has_previous: boolean },
		string | Record<string, string | number | undefined | null>
	  >({
		// Approved, visibility-filtered records only. Supports q, department, program, year, keyword, author, sort, page/page_size.
		query: (arg) => {
		  if (typeof arg === 'string') {
			return `/repository/manuscripts/${arg ? `?q=${encodeURIComponent(arg)}` : ''}`;
		  }
		  const params = new URLSearchParams();
		  Object.entries(arg || {}).forEach(([k, v]) => {
			if (v !== undefined && v !== null && String(v).trim() !== '') params.set(k, String(v));
		  });
		  const qs = params.toString();
		  return `/repository/manuscripts/${qs ? `?${qs}` : ''}`;
		},
	  }),

	  getRepositoryManuscript: builder.query<RepositoryManuscript, number | string>({
		query: (manuscriptID) => `/repository/manuscripts/${manuscriptID}/`,
	  }),

	  getRelatedManuscripts: builder.query<RepositoryManuscript[], number | string>({
		query: (manuscriptID) => `/repository/manuscripts/${manuscriptID}/related/`,
	  }),

	  getBookmarks: builder.query<RepositoryManuscript[], void>({
		query: () => '/repository/bookmarks/',
	  }),
	  addBookmark: builder.mutation<{ bookmarked: boolean }, number | string>({
		query: (manuscriptID) => ({
		  url: '/repository/bookmarks/',
		  method: 'POST',
		  body: { manuscriptID },
		}),
	  }),
	  removeBookmark: builder.mutation<{ bookmarked: boolean }, number | string>({
		query: (manuscriptID) => ({
		  url: `/repository/bookmarks/${manuscriptID}/`,
		  method: 'DELETE',
		}),
	  }),

	  getFacultyQueue: builder.query<any, void>({
		query: () => '/panel/queue/',
	  }),
	  reviewFacultyApplication: builder.mutation<
		{ message: string; status: string; committee_decision?: boolean; completeness?: any },
		{ type: string; id: number | string; status: 'approved' | 'rejected' | 'revision_required'; comments?: string; committee_decision?: boolean }
	  >({
		query: (body) => ({
		  url: '/panel/review/',
		  method: 'POST',
		  body,
		}),
	  }),

	  // Manuscript review decision (approve / reject / revision required)
	  getAdminManuscripts: builder.query<any[], { status?: string; q?: string } | void>({
		query: (arg) => {
		  const params = new URLSearchParams();
		  if (arg && arg.status) params.set('status', arg.status);
		  if (arg && arg.q) params.set('q', arg.q);
		  const qs = params.toString();
		  return `/manuscripts/manage/${qs ? `?${qs}` : ''}`;
		},
	  }),
	  reviewManuscript: builder.mutation<
		{ message: string; manuscriptID: number; status: string },
		{ manuscriptID: number | string; status: 'approved' | 'rejected' | 'revision_required'; comments?: string }
	  >({
		query: ({ manuscriptID, status, comments }) => ({
		  url: `/manuscripts/${manuscriptID}/review/`,
		  method: 'POST',
		  body: { status, comments },
		}),
	  }),
  
	  // Retrieve Stats for Admin
	  getDocumentCount: builder.query<DocumentCount, void>({
		query: () => '/document-count/',
	  }),
	  listFiles: builder.query<{ generated_documents_files: string[]; manuscripts_files: string[] }, void>({
		query: () => '/list-files/',
	  }),
	  getAuditLogs: builder.query<any[], { action?: string; limit?: number } | void>({
		query: (arg) => {
		  const params = new URLSearchParams();
		  if (arg && arg.action) params.set('action', arg.action);
		  if (arg && arg.limit) params.set('limit', String(arg.limit));
		  const qs = params.toString();
		  return `/audit-logs/${qs ? `?${qs}` : ''}`;
		},
	  }),

	  listUsers: builder.query<User[], void>({
		query: () => '/list-users/',
	  }),
  
	  addUser: builder.mutation<AddUserResponse, AddUserInput>({
		query: (body) => ({
		  url: '/list-users/',
		  method: 'POST',
		  body,
		}),
	  }),
  
	  updateUser: builder.mutation<User, { userID: string; userData: Partial<User> }>({
		query: ({ userID, userData }) => ({
		  url: `/list-users/${userID}/`,
		  method: 'PUT',
		  body: userData,
		}),
	  }),
  
	  deleteUser: builder.mutation<{ message: string }, string>({
		query: (userID) => ({
		  url: `/list-users/${userID}/`,
		  method: 'DELETE',
		}),
	  }),

	  // --- Stateful defense workflow -------------------------------------
	  getUserProfile: builder.query<any, void>({
		query: () => '/user-role/',
	  }),
	  getWorkflowStatus: builder.query<WorkflowStatus, void>({
		query: () => '/workflow/status/',
		providesTags: ['Workflow'],
	  }),
	  getPanelNominations: builder.query<PanelNomination[], { scope?: 'mine' | 'department' } | void>({
		query: (arg) => {
		  const params = new URLSearchParams();
		  if (arg?.scope) params.set('scope', arg.scope);
		  const qs = params.toString();
		  return `/panel-nominations/${qs ? `?${qs}` : ''}`;
		},
		providesTags: ['Workflow'],
	  }),
	  getPanelNomination: builder.query<PanelNomination, number>({
		query: (nominationID) => `/panel-nominations/${nominationID}/`,
		providesTags: ['Workflow'],
	  }),
	  createPanelNomination: builder.mutation<PanelNomination, PanelNominationInput & { submit?: boolean }>({
		query: (body) => ({ url: '/panel-nominations/', method: 'POST', body }),
		invalidatesTags: ['Workflow'],
	  }),
	  updatePanelNomination: builder.mutation<PanelNomination, { nomination_id: number; data: PanelNominationInput }>({
		query: ({ nomination_id, data }) => ({ url: `/panel-nominations/${nomination_id}/`, method: 'PATCH', body: data }),
		invalidatesTags: ['Workflow'],
	  }),
	  submitPanelNomination: builder.mutation<PanelNomination, number>({
		query: (nomination_id) => ({ url: `/panel-nominations/${nomination_id}/submit/`, method: 'POST', body: {} }),
		invalidatesTags: ['Workflow'],
	  }),
	  revisePanelNomination: builder.mutation<PanelNomination, number>({
		query: (nomination_id) => ({ url: `/panel-nominations/${nomination_id}/revise/`, method: 'POST', body: {} }),
		invalidatesTags: ['Workflow'],
	  }),
	  getApplications: builder.query<WorkflowApplication[], { stage?: WorkflowStage; scope?: 'mine' | 'department' | 'all' } | void>({
		query: (arg) => {
		  const params = new URLSearchParams();
		  if (arg?.stage) params.set('stage', arg.stage);
		  if (arg?.scope) params.set('scope', arg.scope);
		  const qs = params.toString();
		  return `/applications/${qs ? `?${qs}` : ''}`;
		},
		providesTags: ['Workflow'],
	  }),
	  getApplication: builder.query<WorkflowApplication, number>({
		query: (applicationID) => `/applications/${applicationID}/`,
		providesTags: ['Workflow'],
	  }),
	  createApplication: builder.mutation<WorkflowApplication, Partial<WorkflowApplication> & { stage: WorkflowStage }>({
		query: (body) => ({ url: '/applications/', method: 'POST', body }),
		invalidatesTags: ['Workflow'],
	  }),
	  updateApplication: builder.mutation<WorkflowApplication, { applicationID: number; data: Partial<WorkflowApplication> }>({
		query: ({ applicationID, data }) => ({ url: `/applications/${applicationID}/`, method: 'PATCH', body: data }),
		invalidatesTags: ['Workflow'],
	  }),
	  submitApplication: builder.mutation<WorkflowApplication, number>({
		query: (applicationID) => ({ url: `/applications/${applicationID}/submit/`, method: 'POST', body: {} }),
		invalidatesTags: ['Workflow'],
	  }),
	  reviseApplication: builder.mutation<WorkflowApplication, number>({
		query: (applicationID) => ({ url: `/applications/${applicationID}/revise/`, method: 'POST', body: {} }),
		invalidatesTags: ['Workflow'],
	  }),

	  getPanelAssignments: builder.query<{
	    application_id: number;
	    panel: PanelAssignment[];
	    panel_history: PanelAssignment[];
	    panel_locked: boolean;
	    panel_readiness: WorkflowApplication['panel_readiness'];
	    permissions: WorkflowApplication['permissions'];
	  }, number>({
		query: (applicationID) => `/applications/${applicationID}/panel/`,
		providesTags: ['Workflow'],
	  }),
	  assignPanelist: builder.mutation<any, { applicationID: number; faculty_id: number; position: string; replace_assignment_id?: number }>({
		query: ({ applicationID, ...body }) => ({ url: `/applications/${applicationID}/panel/`, method: 'POST', body }),
		invalidatesTags: ['Workflow'],
	  }),
	  removePanelist: builder.mutation<any, { applicationID: number; assignmentID: number }>({
		query: ({ applicationID, assignmentID }) => ({ url: `/applications/${applicationID}/panel/${assignmentID}/`, method: 'DELETE' }),
		invalidatesTags: ['Workflow'],
	  }),
	  unlockPanelCorrection: builder.mutation<WorkflowApplication, number>({
		query: (applicationID) => ({ url: `/applications/${applicationID}/panel/unlock-correction/`, method: 'POST', body: {} }),
		invalidatesTags: ['Workflow'],
	  }),
	  getPanelInvitations: builder.query<PanelInvitation[], void>({
		query: () => '/panel/invitations/',
		providesTags: ['Workflow'],
	  }),
	  respondAssignment: builder.mutation<any, { assignmentID: number; decision: 'accept' | 'decline'; reason?: string }>({
		query: ({ assignmentID, ...body }) => ({ url: `/panel/assignments/${assignmentID}/respond/`, method: 'POST', body }),
		invalidatesTags: ['Workflow'],
	  }),
	  attachSignature: builder.mutation<any, { applicationID: number; signature: File }>({
		query: ({ applicationID, signature }) => {
		  const body = new FormData();
		  body.append('signature', signature);
		  return { url: `/applications/${applicationID}/signature/`, method: 'POST', body };
		},
		invalidatesTags: ['Workflow'],
	  }),
	  decideApplication: builder.mutation<any, {
	    applicationID: number;
	    decision: 'approve' | 'reject' | 'revision';
	    signature?: File | null;
	    reason?: string;
	    comments?: string;
	  }>({
		query: ({ applicationID, decision, signature, reason, comments }) => {
		  const body = new FormData();
		  if (signature) body.append('signature', signature);
		  if (reason) body.append('reason', reason);
		  if (comments) body.append('comments', comments);
		  return { url: `/applications/${applicationID}/${decision}/`, method: 'POST', body };
		},
		invalidatesTags: ['Workflow'],
	  }),
	  getSignedForm: builder.query<Blob, number>({
		query: (applicationID) => ({
		  url: `/applications/${applicationID}/form/`,
		  responseHandler: (response: Response) => response.blob(),
		}),
	  }),
	  getApplicationSchedule: builder.query<DefenseSchedule | null, number>({
		query: (applicationID) => `/applications/${applicationID}/schedule/`,
		providesTags: ['Workflow'],
	  }),
	  proposeSchedule: builder.mutation<DefenseSchedule, { applicationID: number } & ScheduleInput>({
		query: ({ applicationID, ...body }) => ({ url: `/applications/${applicationID}/schedule/`, method: 'POST', body }),
		invalidatesTags: ['Workflow'],
	  }),
	  confirmSchedule: builder.mutation<DefenseSchedule, number>({
		query: (scheduleID) => ({ url: `/schedules/${scheduleID}/confirm/`, method: 'POST', body: {} }),
		invalidatesTags: ['Workflow'],
	  }),
	  getPanelSchedules: builder.query<DefenseSchedule[], void>({
		query: () => '/panel/schedule/',
		providesTags: ['Workflow'],
	  }),
	  getNotifications: builder.query<NotificationItem[], void>({
		query: () => '/notifications/',
		providesTags: ['Notifications'],
	  }),
	  markNotificationRead: builder.mutation<{ message: string }, number>({
		query: (notificationID) => ({ url: `/notifications/${notificationID}/read/`, method: 'POST', body: {} }),
		invalidatesTags: ['Notifications'],
	  }),

	  getDepartments: builder.query<DepartmentRecord[], void>({
		query: () => '/departments/',
		providesTags: ['Workflow'],
	  }),
	  createDepartment: builder.mutation<DepartmentRecord, { name: string; code?: string }>({
		query: (body) => ({ url: '/departments/', method: 'POST', body }),
		invalidatesTags: ['Workflow'],
	  }),
	  updateDepartment: builder.mutation<DepartmentRecord, { departmentID: number; data: Partial<DepartmentRecord> }>({
		query: ({ departmentID, data }) => ({ url: `/departments/${departmentID}/`, method: 'PATCH', body: data }),
		invalidatesTags: ['Workflow'],
	  }),
	  deleteDepartment: builder.mutation<{ message: string }, number>({
		query: (departmentID) => ({ url: `/departments/${departmentID}/`, method: 'DELETE' }),
		invalidatesTags: ['Workflow'],
	  }),
	  getSystemSettings: builder.query<Record<string, string>, void>({
		query: () => '/settings/',
		providesTags: ['Workflow'],
	  }),
	  updateSystemSettings: builder.mutation<Record<string, string>, Record<string, string>>({
		query: (body) => ({ url: '/settings/', method: 'PUT', body }),
		invalidatesTags: ['Workflow'],
	  }),
	  getOfficialTemplates: builder.query<OfficialTemplateRecord[], void>({
		query: () => '/settings/templates/',
		providesTags: ['Workflow'],
	  }),
	  updateOfficialTemplate: builder.mutation<any, { code: string; data: FormData }>({
		query: ({ code, data }) => ({ url: `/settings/templates/${code}/`, method: 'PATCH', body: data }),
		invalidatesTags: ['Workflow'],
	  }),
	}),
  })
  
  export const {
	useRetrieveUserQuery,
	useLoginMutation,
	useGetUserRoleMutation,
	useRegisterMutation,
	useVerifyMutation,
	useLogoutMutation,
	useActivationMutation,
	useResetPasswordMutation,
	useResetPasswordConfirmMutation,
	
	useGetFacultyQuery,
	useGetAdminFacultyQuery,
	useCreateFacultyMutation,
	useUpdateFacultyMutation,
	useDeleteFacultyMutation,
	useApplicationGenerateMutation,
	useProposalGenerateMutation,
	useFinalGenerateMutation,
	usePanelGenerateMutation,
	useAdminUpdateApplicationTemplateMutation,
	useAdminUpdatePanelTemplateMutation,

	useManuscriptSubmissionMutation,
	useSearchManuscriptsQuery,
	useGetRepositoryManuscriptQuery,
	useGetRelatedManuscriptsQuery,
	useGetBookmarksQuery,
	useAddBookmarkMutation,
	useRemoveBookmarkMutation,
	useGetFacultyQueueQuery,
	useReviewFacultyApplicationMutation,
	useGetAdminManuscriptsQuery,
	useReviewManuscriptMutation,
  
	useGetDocumentCountQuery,
	useListFilesQuery,
	useGetAuditLogsQuery,
	useListUsersQuery,
	useAddUserMutation,
	useUpdateUserMutation,
	useDeleteUserMutation,
	useGetUserProfileQuery,
	useGetWorkflowStatusQuery,
	useGetPanelNominationsQuery,
	useGetPanelNominationQuery,
	useCreatePanelNominationMutation,
	useUpdatePanelNominationMutation,
	useSubmitPanelNominationMutation,
	useRevisePanelNominationMutation,
	useGetApplicationsQuery,
	useGetApplicationQuery,
	useCreateApplicationMutation,
	useUpdateApplicationMutation,
	useSubmitApplicationMutation,
	useReviseApplicationMutation,
	useGetPanelAssignmentsQuery,
	useAssignPanelistMutation,
	useRemovePanelistMutation,
	useUnlockPanelCorrectionMutation,
	useGetPanelInvitationsQuery,
	useRespondAssignmentMutation,
	useAttachSignatureMutation,
	useDecideApplicationMutation,
	useGetSignedFormQuery,
	useLazyGetSignedFormQuery,
	useGetApplicationScheduleQuery,
	useProposeScheduleMutation,
	useConfirmScheduleMutation,
	useGetPanelSchedulesQuery,
	useGetNotificationsQuery,
	useMarkNotificationReadMutation,
	useGetDepartmentsQuery,
	useCreateDepartmentMutation,
	useUpdateDepartmentMutation,
	useDeleteDepartmentMutation,
	useGetSystemSettingsQuery,
	useUpdateSystemSettingsMutation,
	useGetOfficialTemplatesQuery,
	useUpdateOfficialTemplateMutation,
  } = authApiSlice;