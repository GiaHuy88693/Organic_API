export interface AccessTokenDto {
  userId: string
  email: string
  deviceId: string
  roleId: string
  roleName: string
}

export interface RefreshTokenDto {
  userId: string
  email: string
}
