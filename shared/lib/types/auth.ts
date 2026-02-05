export type AccessTokenPayload = {
  userId: number;
  email: string;
  iat: number; // issued at когда токен был создан
  exp: number; // expiration date когда токен будет истекать
};
