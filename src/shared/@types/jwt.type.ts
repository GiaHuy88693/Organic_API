export interface AccessTokenPayload {
  userId: string
  email: string
  deviceId: string
  roleId: string
  roleName: string
  iat: number
  exp: number
}

export interface RefreshTokenPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

export enum JwtType {
  accessToken = 'AccessToken',
  refreshToken = 'RefreshToken',
}
