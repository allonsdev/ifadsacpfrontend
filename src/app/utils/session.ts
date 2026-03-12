import { JwtHelperService } from "@auth0/angular-jwt";

export function session(): boolean {
  const token = localStorage.getItem('authToken');
  const helper = new JwtHelperService();
  if (token) {
    return true;
  } else {
    return false;
  }
}
