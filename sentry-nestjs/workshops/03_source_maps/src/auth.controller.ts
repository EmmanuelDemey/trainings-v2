import { Body, Controller, HttpCode, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  @HttpCode(200)
  login(@Body() body: { email?: string; password?: string }): { token: string } {
    if (body.email === 'crash@example.com') {
      // A bug in the login code: the request body — with its password — is
      // right there, in the request this event comes from.
      throw new Error('Session store unavailable');
    }
    return { token: `token-for-${body.email ?? 'anonymous'}` };
  }
}
