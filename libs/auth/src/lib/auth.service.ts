import { Injectable } from '@nestjs/common'

@Injectable()
export class AuthService {
  sayHello() {
    return 'Hello World';
  }
}
