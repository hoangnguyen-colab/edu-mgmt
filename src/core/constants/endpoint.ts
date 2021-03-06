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
  FILE: 'file',
  ANSWER: 'answer',
  RESULT: 'result',
};

export const ENDPOINTS = {
  LOGIN: `${CONTEXT.API}\\${CONTROLLERS.USER}/login`,
  SIGN_UP: `${CONTEXT.API}\\${CONTROLLERS.USER}/sign-up`,

  USER: `${CONTEXT.API}\\${CONTROLLERS.USER}`,
  TEACHER: `${CONTEXT.API}\\${CONTROLLERS.TEACHER}`,
  CLASS: `${CONTEXT.API}\\${CONTROLLERS.CLASS}`,
  STUDENT: `${CONTEXT.API}\\${CONTROLLERS.STUDENT}`,
  HOME_WORK: `${CONTEXT.API}\\${CONTROLLERS.HOME_WORK}`,
  FILE: `${CONTEXT.API}\\${CONTROLLERS.FILE}`,
  ANSWER: `${CONTEXT.API}\\${CONTROLLERS.ANSWER}`,
  RESULT: `${CONTEXT.API}\\${CONTROLLERS.RESULT}`,

  CLASS_ADD_STUDENT: `${CONTEXT.API}\\${CONTROLLERS.CLASS}/add-student`,
  CLASS_FIND_STUDENT: `${CONTEXT.API}\\${CONTROLLERS.CLASS}/find-student`,
  CLASS_EDIT_STATUS: `${CONTEXT.API}\\${CONTROLLERS.CLASS}/edit-status`,
  CLASS_EDIT_STUDENT: `${CONTEXT.API}\\${CONTROLLERS.CLASS}/edit-student`,
  CLASS_REMOVE_STUDENT: `${CONTEXT.API}\\${CONTROLLERS.CLASS}/remove-student`,
  STUDENT_READ_EXCEL: `${CONTEXT.API}\\${CONTROLLERS.STUDENT}/import`,
  STUDENT_ADD_STUDENT: `${CONTEXT.API}\\${CONTROLLERS.STUDENT}/add-student`,
  HOMEWORK_EDIT_STATUS: `${CONTEXT.API}\\${CONTROLLERS.HOME_WORK}/edit-status`,
  HOMEWORK_CHECK: `${CONTEXT.API}\\${CONTROLLERS.HOME_WORK}/check`,
  ANSWER_SUBMIT: `${CONTEXT.API}\\${CONTROLLERS.ANSWER}/submit`,
};
