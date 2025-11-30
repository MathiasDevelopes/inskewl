export interface User {
  username: any;
  displayName: string;
  givenName: string;
  familyName: string;
  roles: string[];
  academicYearId: number;
  facultyId: any;
  localId: any;
  learnerId: number;
  userInfoId: number;
  locale: Locale;
  schoolName: string;
  tenant: number;
}

export interface Locale {
  country: string;
  language: string;
  locale: string;
}
