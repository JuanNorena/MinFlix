import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): Record<string, string> {
    return {
      service: 'minflix-backend',
      status: 'ok',
    };
  }
}
