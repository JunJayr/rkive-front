import { apiSlice } from '../services/apiSlice';

interface Faculty {
	facultyID: number;
	name: string;

};

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
  panel_chair: string;
  adviser: string;
  panel1: string;
  panel2: string;
  panel3: string;
  documenter: string;
  [key: `co_researcher${number}`]: string;
  [key: `panel${number}`]: string;
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
	  getUserRole: builder.mutation<{ is_superuser: boolean; is_staff: boolean; is_active: boolean; is_dean: boolean; is_headdept: boolean; is_faculty: boolean; is_student: boolean }, {}>({
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
  
	  // Manuscript Submission API
	  manuscriptSubmission: builder.mutation({
		query: (formData: FormData) => ({
		  url: '/manuscripts/',
		  method: 'POST',
		  body: formData,
		}),
	  }),
	  // Retrieve Manuscripts API
	  searchManuscripts: builder.query<any[], string>({
		query: (searchQuery) => `/manuscripts/?q=${encodeURIComponent(searchQuery)}`,
		transformResponse: (response: any[]) => response,
	  }),
  
	  // Retrieve Stats for Admin
	  getDocumentCount: builder.query<DocumentCount, void>({
		query: () => '/document-count/',
	  }),
	  listFiles: builder.query<any[], void>({
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
	useApplicationGenerateMutation,
	useProposalGenerateMutation,
	useFinalGenerateMutation,
	usePanelGenerateMutation,
  
	useManuscriptSubmissionMutation,
	useSearchManuscriptsQuery,
  
	useGetDocumentCountQuery,
	useListFilesQuery,
	useListUsersQuery,
	useAddUserMutation,
	useUpdateUserMutation,
	useDeleteUserMutation,
  } = authApiSlice;