
import { Get, Body, Controller, Post, Put, Req, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-tokens.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { UpdateUserIndoDto } from './dtos/update-userInfo.dto'


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    async signUp(@Body() signupData: SignupDto) {
        return this.authService.signup(signupData);
    }

    @Get('confirm-email')
    async confirmEmail(@Query('token') token: string) {
        return this.authService.confirmEmail(token);
    }

    @Post('login')
    async login(@Body() credentials: LoginDto) {
        return this.authService.login(credentials);
    }

    @Get('users')
    async getAllUsers() {
        return this.authService.getAllUsers();
    }

    @Post('refresh')
    async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshTokens(refreshTokenDto.refreshToken);
    }

    // @UseGuards(AuthenticationGuard)
    @Put('change-password')
    async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
        return this.authService.changePassword(
            changePasswordDto.oldPassword,
            changePasswordDto.newPassword,
            changePasswordDto.userId,

        );
    }

    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto.email);
    }

    @Post('verify-otp')
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
        const { recoveryCode } = verifyOtpDto;
        console.log(recoveryCode)

        // Call the service to verify the OTP and get the reset token
        const result = await this.authService.verifyOtp(recoveryCode);
        return result; // Returns the reset token
    }

    @Put('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        const { newPassword, resetToken } = resetPasswordDto;

        // Call the service to reset the password

        const result = await this.authService.resetPassword(newPassword, resetToken);
        return result; // Success message after password reset

    }

    @Put('update-user')
    async upadteUserInfo(@Body() updateuserinfo: UpdateUserIndoDto) {

        // Call the service to reset the password
        var email = updateuserinfo.email;
        var name1 = updateuserinfo.name;
        var userId = updateuserinfo.userId;

        const result = await this.authService.upadetuserInformation(name1, email, userId);
        return result; // Success message after password reset

    }


}