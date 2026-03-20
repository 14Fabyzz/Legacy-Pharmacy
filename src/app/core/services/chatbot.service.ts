import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = environment.apiUrl + '/api/v1/chatbot/ask';

  constructor(private http: HttpClient) { }

  askQuestion(question: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { question: question });
  }
}
