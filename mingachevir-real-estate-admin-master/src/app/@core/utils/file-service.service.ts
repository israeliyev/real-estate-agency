import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import { NgxImageCompressService } from 'ngx-image-compress';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiBasePath = environment.apiUrl;
  private maxImageSizeMB = 5; // Max size for images
  private maxVideoSizeMB = 50; // Max size for videos
  private storageKey = 'uploadedFiles';

  constructor(
    private http: HttpClient,
    private imageCompress: NgxImageCompressService
  ) {}

  processAndUploadFile(file: File): Observable<string> {
    const validTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/heic',
      'video/mp4',
      'video/mpeg',
      'video/quicktime', // .mov files
      'video/webm',
      'video/ogg',
    ];
    const fileSizeMB = file.size / (1024 * 1024); // Convert bytes to MB
    if (!validTypes.includes(file.type)) {
      return throwError(new Error('Fayl növü qəbul edilmir'));
    }
    let maxSizeMB: number;
    if (file.type.startsWith('image/')) {
      maxSizeMB = this.maxImageSizeMB;
    } else if (file.type.startsWith('video/')) {
      maxSizeMB = this.maxVideoSizeMB;
    } else {
      return throwError(new Error('Fayl növü qəbul edilmir'));
    }
    if (fileSizeMB > maxSizeMB) {
      return throwError(
        new Error(`Faylın ölçüsü ${maxSizeMB} MB'dan böyük olmamalıdır`)
      );

    }
    if (fileSizeMB > 1 && file.type.startsWith('image/')) {
      return this.compressImage(file).pipe(
        switchMap(compressedFile => this.uploadFile(compressedFile)),
        switchMap(url => {
          const fullUrl = `${url}`;
          const files = this.getStoredFiles();
          files.push(fullUrl);
          this.saveStoredFiles(files);
          return new Observable<string>(observer => {
            observer.next(fullUrl);
            observer.complete();
          });
        }),
      );
    }

    return new Observable<string>(observer => {
      this.uploadFile(file).subscribe({
        next: url => {
          const fullUrl = `${url}`;
          const files = this.getStoredFiles();
          files.push(fullUrl);
          this.saveStoredFiles(files);

          observer.next(fullUrl);
          observer.complete();
        }
      });
    });
  }

  deleteFile(filePath: string): Observable<void> {
    const decodedFilePath = decodeURI(filePath);
    const params = new HttpParams().set('filePath', decodedFilePath);
    return this.http.delete<void>(`${this.apiBasePath}/file/delete`, {params}).pipe(
      catchError(err => throwError(() => this.handleHttpError(err))),
      switchMap(() => {
        const files = this.getStoredFiles();
        const updatedFiles = files.filter(url => url !== decodedFilePath);
        this.saveStoredFiles(updatedFiles);
        return new Observable<void>(observer => {
          observer.next();
          observer.complete();
        });
      }),
    );
  }

  public getStoredFiles(): string[] {
    const storedFiles = localStorage.getItem(this.storageKey);
    return storedFiles ? JSON.parse(storedFiles) : [];
  }

  private saveStoredFiles(files: string[]): void {
    if (files.length > 0) {
      localStorage.setItem(this.storageKey, JSON.stringify(files));
    } else {
      localStorage.removeItem(this.storageKey);
    }
  }

  private uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<string>(`${this.apiBasePath}/file/upload`, formData, {
        responseType: 'text' as 'json'
      })
      .pipe(  catchError(err => {
        console.log('Upload error:', err);
        const errorMessage = this.handleHttpError(err);
        return throwError(errorMessage);
      }));
  }

  private handleHttpError(err: HttpErrorResponse | any): string {
    let errorMessage = 'Şəkil və ya video yükənən zaman xəta baş verdi';
    if (err instanceof HttpErrorResponse) {
      if (err.error instanceof ErrorEvent) {
        errorMessage = `İnternet bağlantısı xətası: ${err.error.message}`;
      } else if (err.status) {
        const serverMessage = err.error?.message || err.statusText;
        if (serverMessage.includes("Image too large")) {
          errorMessage = "Şəkil çox böyükdür, maksimum 5MB olmalıdır";
        } else if (serverMessage.includes("Video too large")) {
          errorMessage = "Video çox böyükdür, maksimum 100MB olmalıdır";
        } else if (serverMessage.includes("Invalid file type")) {
          errorMessage = "Fayl növü qəbul edilmir";
        } else if (serverMessage.includes("Error saving image: Error saving image")) {
          errorMessage = "Şəkili saxlamaq mümkün olmadı";
        } else {
          errorMessage = `${err.status}: ${serverMessage || 'Server xətası'}`;
        }
      }
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    return errorMessage;
  }

  private dataUrlToFile(dataUrl: string, fileName: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, {type: mime});
  }

  private compressImage(file: File): Observable<File> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const imageDataUrl = event.target.result;
        this.imageCompress.compressFile(imageDataUrl, -1, 75, 75).then(
          compressedDataUrl => {
            const compressedFile = this.dataUrlToFile(compressedDataUrl, file.name);
            observer.next(compressedFile);
            observer.complete();
          },
          error => observer.error(new Error('Şəkili sıxarkən xəta baş verdi'))
        );
      };
      reader.onerror = () => observer.error(new Error('Faylı oxumaq alınmadı'));
      reader.readAsDataURL(file);
    });
  }
}
