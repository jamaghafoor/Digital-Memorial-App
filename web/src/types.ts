export type Template = 'christian' | 'islamic' | 'buddhist' | 'floral' | 'modern';
export type Status = 'pending' | 'approved' | 'rejected';
export interface Memorial {
  _id: string; userId: string | { _id: string; name: string; email: string }; fullName: string; photo: string;
  birthDate: string; deathDate: string; relationship: string; religion: string; message: string;
  template: Template; reminderEnabled: boolean; status: Status; slug?: string; createdAt: string;
}
export interface User { _id: string; name: string; email: string; role: string; preferredLanguage: string; memorialCount: number; createdAt: string; }
