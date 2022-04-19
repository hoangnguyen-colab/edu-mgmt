export const CONTEXT = {
  API: 'api',
  STATIC: 'static',
  ADMIN: 'admin',
};

export const CONTROLLERS = {
  USER: 'user',
  CLASS: 'class',
  STUDENT: 'student',
  TEACHER: 'teacher',
  HOME_WORK: 'home-work',
};

export const ENDPOINTS = {
  LOGIN: `${CONTEXT.API}\\${CONTROLLERS.USER}/login`,
  SIGN_UP: `${CONTEXT.API}\\${CONTROLLERS.USER}/sign-up`,

  USER: `${CONTEXT.API}\\${CONTROLLERS.USER}`,
  TEACHER: `${CONTEXT.API}\\${CONTROLLERS.TEACHER}`,
  CLASS: `${CONTEXT.API}\\${CONTROLLERS.CLASS}`,
  STUDENT: `${CONTEXT.API}\\${CONTROLLERS.STUDENT}`,
  HOME_WORK: `${CONTEXT.API}\\${CONTROLLERS.HOME_WORK}`,
};
