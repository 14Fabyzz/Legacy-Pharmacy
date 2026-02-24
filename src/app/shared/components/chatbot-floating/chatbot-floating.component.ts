import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatbotService } from '../../../core/services/chatbot.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

interface ChatMessage {
  role: 'user' | 'bot';
  content?: string;
  type: 'text' | 'table' | 'chart';
  tableData?: any[];
  chartData?: ChartConfiguration['data'];
  chartOptions?: ChartConfiguration['options'];
  chartType?: ChartType;
}

@Component({
  selector: 'app-chatbot-floating',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './chatbot-floating.component.html',
  styleUrl: './chatbot-floating.component.css'
})
export class ChatbotFloatingComponent implements AfterViewChecked {
  @ViewChild('chatWindow') chatWindow!: ElementRef;

  isOpen = false;
  isTyping = false;
  userInput = '';
  messages: ChatMessage[] = [];

  constructor(private chatbotService: ChatbotService, private router: Router) {
    // La bienvenida inicial ahora la maneja la "welcome-card" en el HTML
  }

  // Oculta el chatbot en la pantalla de ventas (POS)
  get isVentasRoute(): boolean {
    return this.router.url.includes('/ventas');
  }

  // Permite enviar mensajes rápidos accionados desde botones del HTML
  sendQuickMessage(message: string) {
    this.userInput = message;
    this.sendMessage();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  scrollToBottom(): void {
    if (this.chatWindow) {
      this.chatWindow.nativeElement.scrollTop = this.chatWindow.nativeElement.scrollHeight;
    }
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isTyping) return;

    const question = this.userInput;
    this.messages.push({ role: 'user', type: 'text', content: question });
    this.userInput = '';
    this.isTyping = true;

    this.chatbotService.askQuestion(question).subscribe({
      next: (res: any) => {
        this.isTyping = false;
        if (res && res.answer) {
          this.processBotResponse(res.answer);
        } else {
          this.messages.push({ role: 'bot', type: 'text', content: 'Respuesta vacía del servidor.' });
        }
      },
      error: (err: any) => {
        this.isTyping = false;
        console.error('Error in chatbot', err);
        this.messages.push({ role: 'bot', type: 'text', content: 'Lo siento, ocurrió un error al comunicarme con el servidor.' });
      }
    });
  }

  private processBotResponse(answerString: string) {
    try {
      const parsed = JSON.parse(answerString);

      const resType = parsed.type || 'text';

      // Manejar variables, el backend manda el arreglo en .content para tablas y graficos
      const payloadData = Array.isArray(parsed.content) ? parsed.content : parsed.data || [];
      const title = parsed.title || '';

      if (resType === 'chart') {
        const labels = payloadData.map((d: any) => d[parsed.label_key]) || [];
        const values = payloadData.map((d: any) => d[parsed.data_key]) || [];

        const chartData: ChartData = {
          labels: labels,
          datasets: [
            {
              data: values,
              label: title || 'Datos',
              backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(236, 72, 153, 0.8)'],
              borderColor: ['#3b82f6', '#10b981', '#8b5cf6', '#ec4899'],
              borderWidth: 1
            }
          ]
        };

        const chartOptions: ChartConfiguration['options'] = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: { color: '#cbd5e1' } // Neon text color
            }
          },
          scales: {
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
          }
        };

        this.messages.push({
          role: 'bot',
          type: 'chart',
          content: title,
          chartData: chartData,
          chartOptions: chartOptions,
          chartType: parsed.chart_type === 'doughnut' ? 'doughnut' : 'bar'
        });

      } else if (resType === 'table') {
        this.messages.push({
          role: 'bot',
          type: 'table',
          content: title || 'Aquí tienes la tabla de datos:',
          tableData: payloadData
        });
      } else {
        // Es tipo texto o no detectado
        let rawContent = parsed.content || answerString;

        // Evitar que un Array puro o un Objeto caiga como [object Object]
        if (typeof rawContent === 'object') {
          rawContent = JSON.stringify(rawContent, null, 2);
        }

        this.messages.push({
          role: 'bot',
          type: 'text',
          content: rawContent
        });
      }
    } catch (e) {
      // Fallback si no es un JSON válido
      this.messages.push({
        role: 'bot',
        type: 'text',
        content: answerString
      });
    }
  }

  getTableHeaders(data: any[]): string[] {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }
}

