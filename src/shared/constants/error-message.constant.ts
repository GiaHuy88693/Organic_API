export const ERROR_MESSAGE = {
  AUTH: {
    GOOGLE_EMAIL_NOT_FOUND: 'Unable to retrieve email from Google. Please try again.',
    GOOGLE_LOGIN_FAILED: 'Google login failed. Please try again.',
    GOOGLE_CALLBACK_FAILED: 'Google OAuth callback failed',
    FACEBOOK_LOGIN_FAILED: 'Facebook login failed. Please try again.',
    FACEBOOK_EMAIL_NOT_FOUND: 'Unable to retrieve email from Facebook.',
    INVALID_OAUTH_STATE: 'Invalid authentication state data.',
    FACEBOOK_TOKEN_FETCH_FAILED: 'Failed to obtain Facebook access token',
    FACEBOOK_USER_FETCH_FAILED: 'Failed to fetch Facebook user info',
    INVALID_ROLE_ID: 'The specified role ID does not exist.',
    ACCESS_TOKEN_REQUIRED: 'Access token is required',
    FACEBOOK_CONFIG_MISSING: 'Facebook OAuth configuration is missing',
    FACEBOOK_AUTH_URL_GENERATION_FAILED: 'Failed to generate Facebook auth URL',
    USER_AGENT_AND_IP_REQUIRED: 'User agent and IP are required',
    USER_NOT_FOUND: 'User not found',
  },
  USER: {
    ACCOUNT_INACTIVE: 'Your account has not been activated.',
    ACCOUNT_BLOCKED: 'Your account has been blocked.',
    ACCOUNT_SUSPENDED: 'Your account has been suspended.',
  },
  COURSE: {
    DRAFT_LIMIT_REACHED: 'You have reached the limit of 5 draft courses.',
    TITLE_ALREADY_EXISTS: 'You already have a course with this title.',
    CATEGORY_NOT_FOUND: 'Selected category does not exist.',
    HASHTAGS_INVALID: 'Some selected hashtags do not exist.',
    NOT_FOUND_OR_FORBIDDEN: 'Course not found or you do not have permission to access it.',
  },
  VALIDATION: {
    FULLNAME_REQUIRED: 'Full name is required',
    FULLNAME_MAX: 'Full name must be at most 100 characters',

    PHONE_MIN: 'Phone number must be at least 9 characters',
    PHONE_MAX: 'Phone number must be at most 15 characters',
    PHONE_INVALID: 'Phone number must contain only digits and optional "+"',

    ADDRESS_MAX: 'Address must be at most 255 characters',
    CITY_MAX: 'City must be at most 100 characters',
    COUNTRY_MAX: 'Country must be at most 100 characters',
    DOB_INVALID: 'Date of birth must be a valid date',
    AVATAR_INVALID_URL: 'Avatar must be a valid URL',
    AVATAR_MAX: 'Avatar URL must be at most 255 characters',
    USERNAME_MIN: 'Username must be at least 3 characters',
    USERNAME_MAX: 'Username must be at most 30 characters',
    USERNAME_INVALID: 'Username can only contain letters, numbers, and underscores',

    COURSE: {
      TITLE_REQUIRED: 'Course title is required',
      TITLE_EMPTY: 'Course title cannot be empty',
      TITLE_MAX: 'Course title must not exceed 255 characters',
      DESCRIPTION_INVALID: 'Description must be a string',
      THUMBNAIL_INVALID: 'Thumbnail must be a valid URL',
      CATEGORY_ID_INVALID: 'Category ID must be a valid integer',
      PRICE_INVALID: 'Price must be a number',
      PRICE_NONNEGATIVE: 'Price must be a non-negative number',
      HASHTAG_IDS_INVALID: 'Hashtag IDs must be an array of integers',
      ISFREE_INVALID: 'isFree must be a boolean',
      ISFEATURED_INVALID: 'isFeatured must be a boolean',
      ISPREORDER_INVALID: 'isPreorder must be a boolean',
      PREVIEW_DESCRIPTION_INVALID: 'Preview description must be a string',
    },
    HASHTAG: {
      INVALID_IDS: 'Hashtag ID must be a valid integer',
      NOT_FOUND: 'Some hashtags do not exist',
    },
    CATEGORY: {
      NOT_FOUND: 'Category not found',
    },
    MODULE: {
      COURSE_ID_REQUIRED: 'Course ID is required',
      COURSE_ID_INVALID: 'Course ID must be a valid integer',
      TITLE_REQUIRED: 'Module title is required',
      TITLE_INVALID: 'Module title must be a string',
      TITLE_EMPTY: 'Module title cannot be empty',
      TITLE_MAX: 'Module title must not exceed 255 characters',
      DESCRIPTION_INVALID: 'Module description must be a string',
      CHAPTER_ORDER_INVALID: 'Chapter order must be a non-negative integer',
    },
    LESSON: {
      MODULE_ID_REQUIRED: 'Module ID is required',
      MODULE_ID_INVALID: 'Module ID must be a valid integer',

      TITLE_REQUIRED: 'Lesson title is required',
      TITLE_INVALID: 'Lesson title must be a string',
      TITLE_EMPTY: 'Lesson title cannot be empty',
      TITLE_MAX: 'Lesson title must not exceed 255 characters',

      VIDEO_URL_INVALID: 'Video URL must be a string',
      VIDEO_URL_FORMAT: 'Video URL must be a valid URL',

      DOCUMENT_URL_INVALID: 'Document URL must be a string',
      DOCUMENT_URL_FORMAT: 'Document URL must be a valid URL',

      LESSON_ORDER_INVALID: 'Lesson order must be a non-negative integer',

      IS_PREVIEWABLE_INVALID: 'Previewable flag must be a boolean',
      EMPTY_ARRAY: 'title cant empty',
      DOCUMENT_URL_HTTPS: 'Document URL must be HTTPS',
    },
    QUIZ: {
      TITLE_REQUIRED:'Required Title'
    },
  },
}
