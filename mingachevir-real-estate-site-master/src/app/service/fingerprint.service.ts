import {Injectable} from '@angular/core';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

@Injectable({
  providedIn: 'root'
})
export class FingerprintService {
  private fpPromise = FingerprintJS.load();

  async generateFingerprint(): Promise<string> {
    const fp = await this.fpPromise;
    const result = await fp.get();
    return result.visitorId;
  }
}
