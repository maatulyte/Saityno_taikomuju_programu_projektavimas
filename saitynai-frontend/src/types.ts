export interface Faculty {
  id: number;
  name?: string;
  address?: string;
}

export interface Mentor {
  id: number;
  name?: string;
  surname?: string;
  email?: string;
  phoneNumber?: string;
  facultyId: number;
  studyProgram?: string;
  studyYear: number;
  studyLevel: number;
}

export interface Group {
  id: number;
  name?: string;
  studyLevel: number;
  studyYear: number;
  mentorId: number;
}

export interface RegisterDto {
  name: string;
  surname: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  username: string;
  password: string;
}
