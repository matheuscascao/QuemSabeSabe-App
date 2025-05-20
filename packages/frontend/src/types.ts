export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    level: number;
    xp: number;
  };
}
