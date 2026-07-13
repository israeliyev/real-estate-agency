import { Injectable } from '@angular/core';

@Injectable()
export class UserService {

  private time: Date = new Date;

  private users = {
    nick: { name: 'Mingəçevir Əmlak Agentliyi', picture: 'assets/images/logo.png' },
  };
  private types = {
    mobile: 'mobile',
    home: 'home',
    work: 'work',
  };
}
