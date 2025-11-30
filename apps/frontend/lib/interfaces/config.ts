export interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
}

export interface EncryptFileSidebarProps {
  user: User;
}