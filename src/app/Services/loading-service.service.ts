import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingServiceService {

  private activeRequests: number = 0;
  isLoading = signal(false);

  show(){
    if(this.activeRequests === 0){
      this.isLoading.set(true);
      this.activeRequests++;
    }
  }
  hide(){
    this.activeRequests--;
    if(this.activeRequests <= 0){
      this.isLoading.set(false);
      this.activeRequests = 0;
    }
  }
  constructor() { }
}
