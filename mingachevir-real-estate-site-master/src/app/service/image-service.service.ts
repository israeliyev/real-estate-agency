import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {NgxImageCompressService} from 'ngx-image-compress';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiBasePath = environment.apiUrl;

  private maxSizeMB = 5;
  private validTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/heic',
  ];
  private storageKey = 'uploadedFiles';

  constructor(
    private http: HttpClient,
    private imageCompress: NgxImageCompressService
  ) {
  }

  processAndUploadFile(file: File): Observable<string> {

    if (!this.validTypes.includes(file.type)) {
      return throwError('Yalnızca PNG, JPG, JPEG, HEIC, HEIF, və ya TIFF şəkilləri qəbul edilir');
    }


    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > this.maxSizeMB) {
      return throwError(`Şəkilin ölçüsü ${this.maxSizeMB} MB'dan böyük olmamalıdır`);
    }

    if (fileSizeMB > 1) {
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


    return this.uploadFile(file).pipe(
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
      })
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
    return this.http.post<string>(`${this.apiBasePath}/file/upload`, formData, {
      responseType: 'text' as 'json'
    }).pipe(
      catchError(err => {
        console.log('Upload error:', err);
        const errorMessage = this.handleHttpError(err);
        return throwError(errorMessage);
      })
    );
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

  private handleHttpError(err: HttpErrorResponse | Error): string {
    let errorMessage = 'Şəkil yükənən zaman xəta baş verdi';
    if (err instanceof HttpErrorResponse) {
      if (err.error instanceof ErrorEvent) {
        errorMessage = `İnternet bağlantısı xətası: ${err.error.message}`;
      } else {
        const serverMessage = typeof err.error === 'string' ? err.error : err.error.message || err.statusText || 'Server xətası';
        switch (serverMessage) {
          case 'Image too large':
            errorMessage = 'Şəkil çox böyükdür, maksimum 5MB olmalıdır';
            break;
          case 'Invalid file type':
            errorMessage = 'Yalnızca PNG, JPG, JPEG, HEIC, HEIF, WEBP, GIF, BMP və ya TIFF şəkilləri qəbul edilir';
            break;
          case 'File is empty':
            errorMessage = 'Şəkil boşdur';
            break;
          case 'Error saving image: Error saving image':
            errorMessage = 'Şəkili saxlamaq mümkün olmadı';
            break;
          default:
            errorMessage = `${err.status}: ${serverMessage}`;
        }
      }
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    return errorMessage;
  }
}
