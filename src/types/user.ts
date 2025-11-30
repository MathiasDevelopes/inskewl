export interface User {
  username: any | null; // we can probably assume username will be string if filled, but i dont have info about this.
  displayName: string;
  givenName: string;
  familyName: string;
  roles: string[];
  academicYearId: number;
  facultyId: any | null; // dont have info about these two.
  localId: any | null; // ...
  learnerId: number;
  userInfoId: number;
  locale: {
    country: string;
    language: string;
    locale: string;
  };
  schoolName: string;
  tenant: number;
}
