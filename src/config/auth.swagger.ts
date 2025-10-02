import { HttpStatus } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger';
import {
  LoginResDTO,
  ProfileResDTO,
  RegisterResDTO,
  UpdateAvatarResDTO,
} from 'src/routes/auth/dto/auth.dto';
import { SuccessMessage } from 'src/shared/constants/message.constant';
import { MESSAGES } from 'src/shared/constants/success-message.constant';

// ============ REGISTER ============
export const registerResponse: ApiResponseOptions = {
  status: HttpStatus.CREATED,
  description: 'User registered successfully',
  type: RegisterResDTO,
  schema: {
    example: {
      statusCode: 201,
      message: SuccessMessage.REGISTER,
      data: {
        id: '64be0ad2e43d2464394feedb',
        email: 'john.doe@gmail.com',
      },
      dateTime: '03-10-2025T12:30:45000',
    },
  },
};

// ============ LOGIN ============
export const loginResponse: ApiResponseOptions = {
  status: HttpStatus.OK,
  description: 'User login success',
  type: LoginResDTO,
  schema: {
    example: {
      statusCode: 200,
      message: SuccessMessage.LOGIN,
      data: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
      dateTime: '03-10-2025T12:30:45000',
    },
  },
};

// ============ PROFILE ============
export const profileResponse: ApiResponseOptions = {
  status: HttpStatus.OK,
  description: 'Get user profile',
  type: ProfileResDTO,
};

// ============ UPDATE PROFILE ============
export const updateProfileResponse: ApiResponseOptions = {
  status: HttpStatus.OK,
  description: 'Profile updated',
  type: ProfileResDTO,
};

// ============ UPLOAD AVATAR ============
export const uploadAvatarResponse: ApiResponseOptions = {
  status: HttpStatus.OK,
  description: 'Avatar uploaded successfully',
  type: UpdateAvatarResDTO,
  schema: {
    example: {
      statusCode: 200,
      message: SuccessMessage.USER.UPLOAD_IMAGE,
      data: {
        url: 'https://res.cloudinary.com/demo/image/upload/v161616616/avatar.jpg',
      },
      dateTime: '03-10-2025T12:30:45000',
    },
  },
};

// ============ LOGOUT ============
export const logoutResponse: ApiResponseOptions = {
  status: HttpStatus.OK,
  description: 'Logout success',
  schema: {
    example: {
      statusCode: 200,
      message: SuccessMessage.LOGOUT,
      data: null,
      dateTime: '03-10-2025T12:30:45000',
    },
  },
};

// ============ LOGOUT ALL DEVICES ============
export const logoutAllResponse: ApiResponseOptions = {
  status: HttpStatus.OK,
  description: 'Logout from all devices success',
  schema: {
    example: {
      statusCode: 200,
      message: SuccessMessage.LOGOUT,
      data: null,
      dateTime: '03-10-2025T12:30:45000',
    },
  },
};
