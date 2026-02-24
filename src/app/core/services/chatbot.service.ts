import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'http://localhost:8080/api/v1/chatbot/ask';

  constructor(private http: HttpClient) { }

  askQuestion(question: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { question: question });
  }
}
