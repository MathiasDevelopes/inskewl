import { z } from "zod";
import { transformISODate, transformISODateTime } from "../../utils/parsing";

export const LocaleSchema = z.object({
  country: z.string(),
  language: z.string(),
  locale: z.string().meta({
    description: "ISO 639 + ISO 3166 locale tag.",
  }),
});

export const UserSchema = z.object({
  username: z.any(),
  displayName: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  roles: z.array(z.string()),
  academicYearId: z.number(),
  facultyId: z.any(),
  localId: z.any(),
  learnerId: z.number(),
  userInfoId: z.number(),
  locale: LocaleSchema,
  schoolName: z.string(),
  tenant: z.number(),
});

export type User = z.infer<typeof UserSchema>;

export const ExchangeDetailsSchema = z.object({
  learnerId: z.number().meta({
    description: "The VIS ID of the learner.",
  }),
  type: z.string().nullable().meta({
    description: "The type of exchange.",
  }),
  country: z.string().nullable().meta({
    description: "The country of the exchange.",
  }),
  duration: z.string().nullable().meta({
    description: "The duration of the exchange.",
  }),
});

export type ExchangeDetails = z.infer<typeof ExchangeDetailsSchema>;

export const SchoolEnrolmentSchema = z.object({
  learnerId: z.number().meta({
    description: "The VIS ID of the learner.",
  }),
  userInfoId: z.null(),
  tenant: z.number().meta({
    description: "The VIS ID of the tenant.",
  }),
  academicYearId: z.null(),
  schoolName: z.string().meta({
    description: "The name of the school the learner is enrolled in.",
  }),
  mainSchool: z.boolean(),
  secondSchool: z.boolean(),
  affiliationType: z.string().nullable(),
  nationalIdentityNumber: z.null(),
  immutableUserId: z.string(),
  address1: z.string().meta({
    description: "The first line of the learner's address.",
  }),
  address2: z.string().meta({
    description: "The second line of the learner's address.",
  }),
  address3: z.string().meta({
    description: "The third line of the learner's address.",
  }),
  address4: z.string().meta({
    description: "The fourth line of the learner's address.",
  }),
  guest: z.boolean(),
  programmeAreaEnrollmentId: z.number().meta({
    description: "The VIS ID of the programme area enrollment.",
  }),
  inCurrentYear: z.boolean().meta({
    description: "Indicates if the learner is enrolled in the current year.",
  }),
  // We could maybe guess that startDate is iso format, but VIS is a loose canon.
  startDate: z.null().meta({
    description: "The start date of the learner's enrollment.",
  }),
  endDate: z.iso
    .datetime({ local: true })
    .transform(transformISODateTime),
  active: z.boolean(),
});

export type SchoolEnrolment = z.infer<typeof SchoolEnrolmentSchema>;

/**
 * UDIR/VIGO completion code ("fullfortkode") for a programme area.
 * Reference: https://regbok.udir.no/35004/3344/35042-1045040.html
 *
 * B: Completed and passed.
 * I: Completed but not passed.
 * M: Not completed because assessment basis is missing.
 * A: Basic competence / IOP-related completion.
 * H: Still in training or part-time learner.
 * S: Discontinued training during the school year.
 * L: Completed apprenticeship or school-based vocational training; trade/journeyman exam not taken.
 * K: Completed training for competence certificate candidate; competence test not taken.
 */
export const CompletionCodeSchema = z.enum([
  "B",
  "I",
  "M",
  "A",
  "H",
  "S",
  "L",
  "K",
]);

export const PersonalInfoSchema = z.object({
  vsware_type: z.string(),
  displayName: z.null(),
  id: z.number().meta({
    description: "The VIS ID of the learner.",
  }),
  userInfoId: z.number(),
  photoId: z.string().meta({
    description: "The filename of the learners profile picture.",
  }),
  givenName: z.string(),
  familyName: z.string(),
  preferredGivenName: z.null(),
  address: z.null(),
  boarderIndicator: z.null(),
  countryCode: z.string().meta({
    description: "The country code of the mobile number. Formatted as XX.",
  }),
  mobilePhone: z.string().meta({
    description: "The mobile phone number of the learner. Formatted as XXXXXXXX.",
  }),
  homePhone: z.null(),
  email: z.email(),
  classGroupId: z.number().nullable().meta(
    {
      description: "The class group the learner is currently in. Null if the learner is not currently in a class group (probably, who knows)",
    }
  ),
  otherId: z.null(),
  leavingDestination: z.null(),
  leavingReason: z.null(),
  destinationLEACode: z.null(),
  destinationEstablishment: z.null(),
  middleNames: z.null(),
  birthDate: z.iso.date().transform(transformISODate),
  gender: z.string().meta({
    description: "The gender of the learner. Experienced values are 'M' for male and 'F' for female.",
  }),
  religionName: z.null(),
  religionAffiliationCode: z.null(),
  startDate: z.iso.date().transform(transformISODate),
  endDate: z.iso.date().transform(transformISODate),
  localId: z.null(),
  photoURL: z.string(),
  showPhone: z.boolean().nullable(),
  showEmail: z.boolean().nullable(),
  showFullName: z.boolean().nullable(),
  mainTeacherMobilePhone: z.string().nullable().meta({
    description: "The mobile phone number of the learner's main teacher. Experienced format to be +47XXXXXXXX, but not guaranteed.",
  }),
  mainTeacherEmail: z.email().nullable().meta({
    description: "The email of the learner's main teacher",
  }),
  mainTeacherFirstName: z.string().nullable().meta({
    description: "The first name of the learner's main teacher",
  }),
  mainTeacherPreferredGivenName: z.null(),
  mainTeacherLastName: z.string().nullable().meta({
    description: "The last name of the learner's main teacher",
  }),
  lockerNumber: z.null(),
  emailOptIn: z.null(),
  mainTeacherWorkforcePersonalId: z.number(),
  leftEarlyReason: z.null(),
  legalGivenName: z.string(),
  legalFamilyName: z.string(),
  previousSchoolTypeEnum: z.null(),
  travellerCode: z.null(),
  previousSchoolRollNo: z.null(),
  countryOfBirthEnum: z.null(),
  nationalityEnum: z.null(),
  username: z.null(),
  tenant: z.number(),
  previousSchoolName: z.null(),
  workforcePersonalId: z.number(),
  classGroupName: z.string().nullable().meta({
    description: "The name of the class group the learner is currently in. Experienced format is something like '2ITA'",
  }),
  nextOfKinPhoneNumber: z.null(),
  nextOfKin: z.null(),
  language: z.null(),
  learnerInfo: z.null(),
  accountActive: z.null(),
  basisOfAdmission: z.null(),
  nationalIdentityNumber: z.null(),
  nationalIdentityNumberType: z.null(),
  adultRight: z.boolean(),
  admissionRight: z.string(),
  affiliation: z.string().nullable(),
  bilingualInstruction: z.null(),
  citizenshipId: z.null(),
  exceptionalCircumstances: z.null(),
  externalCandidate: z.boolean(),
  firstChoiceForm: z.string(),
  hasConfidentialInfo: z.boolean(),
  isMainSchool: z.boolean(),
  languageExemption: z.null(),
  learnerPersonalId: z.number(),
  motherTongueId: z.null(),
  motherTongueInstruction: z.null(),
  municipality: z.null(),
  physicalEducationExemption: z.string().nullable(),
  samiInstruction: z.null(),
  secondChoiceForm: z.string(),
  specialNorwegianInstruction: z.null(),
  individualDecisions: z.null(),
  programmeArea: z.string().nullable().meta({
    description: "UDIR name of the programme area the learner is currently in.",
  }),
  programmeAreaId: z.number().meta({
    description: "The VIS ID of the programme area the learner is currently in.",
  }),
  schoolEnrolments: z.array(SchoolEnrolmentSchema).nullable(),
  residentialAddress: z.null(),
  guest: z.boolean(),
  reasonCodeAdded: z.boolean(),
  feideName: z.string(),
  inAdultEducation: z.boolean(),
  adaptedLanguageEducation: z.boolean(),
  partTime: z.boolean().nullable().meta({
    description: "Whether the learner is part-time.",
  }),
  immutableUserId: z.string(),
  endCause: z.null(),
  completionCode: CompletionCodeSchema.nullable(),
  isSecondSchool: z.boolean(),
  vocationalProgrammeArea: z.boolean().nullable().meta({
    description: "Whether the learner is in a vocational programme area.",
  }),
  exchangeDetails: ExchangeDetailsSchema,
  campusId: z.null(),
  duf: z.null(),
  leftEarly: z.boolean(),
  learnerId: z.object({
    typeId: z.number(),
    userInfoId: z.number(),
    immutableUserId: z.uuid(),
  }),
  leavingEarlyInFuture: z.boolean(),
});

export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
