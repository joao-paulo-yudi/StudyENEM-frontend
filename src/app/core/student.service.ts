import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly KEY = 'studyenem_student';

  get name(): string | null { return localStorage.getItem(this.KEY); }
  set name(v: string) { localStorage.setItem(this.KEY, v); }
  clear() { localStorage.removeItem(this.KEY); }
}
