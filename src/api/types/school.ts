export interface School {
  tenant: number;
  misTenant: number;
  name: string;
  independentSchool: boolean;
  privateSchool: boolean;
  examSchool: boolean;
  adultSchool: boolean;
  schoolTypes: string[];
}
