import { apiClient } from '../axiosInstance';
import { ENDPOINTS } from '../../constants/endpoint';

const { get, post, put } = apiClient;

export const login = (loginInfo: {}) => post(ENDPOINTS.LOGIN, loginInfo);
// export const signUp = (signUpInfo: {}) => post(ENDPOINTS.SIGNUP, signUpInfo);
// export const logOut = () => post(ENDPOINTS.LOGOUT);

export const ClassList = (search: string, sort: string, page: number, record: number) =>
  get(ENDPOINTS.CLASS + `?search=${search}&sort=${sort}&page=${page}&record=${record}`);
export const ClassDetail = (id: string) => get(ENDPOINTS.CLASS + `\\detail\\${id}`);
export const CreateClass = (params: object) => post(ENDPOINTS.CLASS, params);
export const EditClass = (id: string, params: object) => put(ENDPOINTS.CLASS + `\\edit\\${id}`, params);

export const StudentList = (search: string, sort: string, page: number, record: number) =>
  get(ENDPOINTS.STUDENT + `?search=${search}&sort=${sort}&page=${page}&record=${record}`);
export const StudentDetail = (id: string) => get(ENDPOINTS.STUDENT + `\\detail\\${id}`);
export const CreateStudent = (params: object) => post(ENDPOINTS.STUDENT, params);
export const EditStudent = (id: string, params: object) => put(ENDPOINTS.STUDENT + `\\edit\\${id}`, params);

export const TeacherList = (search: string, sort: string, page: number, record: number) =>
  get(ENDPOINTS.TEACHER + `?search=${search}&sort=${sort}&page=${page}&record=${record}`);
export const TeacherDetail = (id: string) => get(ENDPOINTS.TEACHER + `\\detail\\${id}`);
export const CreateTeacher = (params: object) => post(ENDPOINTS.TEACHER, params);
export const EditTeacher = (id: string, params: object) => put(ENDPOINTS.TEACHER + `\\edit\\${id}`, params);

export const UserList = (search: string, sort: string, page: number, record: number) =>
  get(ENDPOINTS.USER + `?search=${search}&sort=${sort}&page=${page}&record=${record}`);
export const UserDetail = (id: string) => get(ENDPOINTS.USER + `\\detail\\${id}`);
export const CreateUser = (params: object) => post(ENDPOINTS.USER + 'create-user', params);

export const HomeWorkList = (search: string, sort: string, page: number, record: number) =>
  get(ENDPOINTS.HOME_WORK + `?search=${search}&sort=${sort}&page=${page}&record=${record}`);
export const HomeWorkDetail = (id: string) => get(ENDPOINTS.HOME_WORK + `\\detail\\${id}`);
export const CreateHomeWork = (params: object) => post(ENDPOINTS.HOME_WORK + '\\create', params);