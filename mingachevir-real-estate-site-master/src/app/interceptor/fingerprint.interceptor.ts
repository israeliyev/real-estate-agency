import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {from, Observable, switchMap} from 'rxjs';
import {FingerprintService} from "../service/fingerprint.service";

@Injectable()
export class FingerprintInterceptor implements HttpInterceptor {

  constructor(private fingerprintService: FingerprintService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.fingerprintService.generateFingerprint()).pipe(
      switchMap(fingerprint => {
        const clonedReq = req.clone({
          setHeaders: {
            'X-Visitor-Fingerprint': fingerprint
          }
        });
        return next.handle(clonedReq);
      })
    );
  }
}
