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
  is_faculty: boolean;
  is_student: boolean;
  account_type?: 'student' | 'panel' | 'admin';
  is_admin?: boolean;
  is_panel?: boolean;
}

interface ApplicationFormData {
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

interface PanelFormData {
  research_title: string;
  co_researcher1: string;
  co_researcher2: string;
  co_researcher3: string;
  co_researcher4: string;
  co_researcher5: string;
  lead_researcher: string;
  adviser: number;
  panel_chair: number;
  panel1: number;
  panel2: number;
  panel3: number;
  [key: `co_researcher${number}`]: string;
  [key: `panel${number}`]: number;
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
		  account_type?: 'student' | 'panel' | 'admin';
		  is_admin?: boolean;
		  is_panel?: boolean;
		  is_superuser: boolean;
		  is_staff: boolean;
		  is_active: boolean;
		  is_dean: boolean;
		  is_headdept: boolean;
		  is_faculty: boolean;
		  is_student: boolean;
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
	  panelGenerate: builder.mutation<Blob, PanelFormData>({
		query: (formData) => ({
		  url: '/panel-docx/',
		  method: 'POST',
		  body: formData,
		  responseHandler: async (response) => await response.blob(), // ensure we parse it as Blob
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
		{ message: string; status: string },
		{ type: string; id: number | string; status: 'approved' | 'rejected' | 'revision_required'; comments?: string }
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
  
	  listUsers: builder.query<User[], void>({
		query: () => '/list-users/',
	  }),
  
	  addUser: builder.mutation<AddUserResponse, AddUserInput>({
		query: ({ first_name, last_name, email, password, repassword }) => ({
		  url: '/list-users/',
		  method: 'POST',
		  body: { first_name, last_name, email, password, repassword },
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
	useListUsersQuery,
	useAddUserMutation,
	useUpdateUserMutation,
	useDeleteUserMutation,
  } = authApiSlice;