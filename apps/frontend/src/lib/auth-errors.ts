export interface AuthErrorMap {
  title: string;
  message: string;
  type: "error" | "warning" | "info";
}

export const ERROR_MESSAGES: Record<string, AuthErrorMap> = {
  invalid_token: {
    title: 'Invalid Link',
    message: 'The link is either invalid or already used.',
    type: 'error',
  },
  expired_token: {
    title: 'Link Expired',
    message: 'The link expired 24 hours ago. Please request a new one.',
    type: 'error',
  },
  token_not_found: {
    title: 'Link Not Found',
    message: 'We couldn’t find the link. Please request a new one.',
    type: 'error',
  },
  email_not_confirmed: {
    title: 'Email Not Confirmed',
    message: 'Your email is not verified. Please check your inbox for a confirmation email.',
    type: 'warning',
  },
  email_already_confirmed: {
    title: 'Already Verified',
    message: 'Your email is already confirmed.',
    type: 'info',
  },
  user_not_found: {
    title: 'User Not Found',
    message: 'No account found with this email address.',
    type: 'error',
  },
  weak_password: {
    title: 'Weak Password',
    message: 'The password you entered is too weak. Please choose a stronger one.',
    type: 'warning',
  },
  over_email_send_rate_limit: {
    title: 'Too Many Requests',
    message: 'You’ve reached the limit for password reset requests. Please try again later.',
    type: 'error',
  },
  default: {
    title: 'Error',
    message: 'An unknown error occurred. Please try again.',
    type: 'error',
  },
};

export const getAuthErrorMessage = (errorCode: string): AuthErrorMap => {
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES['default'];
};
