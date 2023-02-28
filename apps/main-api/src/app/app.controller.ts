import { Controller, Get } from '@nestjs/common';
import { AuthService } from '@org/auth';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService
  ) { }

  @Get()
  getData() {
    return this.appService.getData();
  }
  @Get('hello')
  sayHello() {
    return this.authService.sayHello();
  }
}
