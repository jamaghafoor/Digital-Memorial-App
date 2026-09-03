export type Template = 'christian' | 'islamic' | 'buddhist' | 'floral' | 'modern';
export interface MemorialDraft { fullName:string; photo:string; birthDate:string; deathDate:string; relationship:string; religion:string; message:string; template:Template; reminderEnabled:boolean; }
export interface Memorial extends MemorialDraft { _id:string; status:'pending'|'approved'|'rejected'; slug?:string; createdAt:string; }
export interface User { id:string; name:string; email:string; role:'USER'|'ADMIN'; preferredLanguage:string; }
export type RootStackParams = { Auth:undefined; Main:undefined; Register:undefined; Preview:{draft:MemorialDraft}; MemorialDetail:{memorial:Memorial}; Language:undefined; };
export type TabParams = { Home:undefined; Create:undefined; Memorials:undefined; Profile:undefined; };
