import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { URLs } from '../api/api-urls';
import { IEventUpdate } from '../../shared/interfaces/event-update.interface';

@Injectable({
  providedIn: 'root',
})
export class EventWebSocketService implements OnDestroy {
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;
  private readonly updatesSubject = new Subject<IEventUpdate>();

  readonly updates$ = this.updatesSubject.asObservable();

  connect(): void {
    if (this.client?.active) {
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(URLs.wsEndpoint),
      reconnectDelay: 5000,
      onConnect: () => this.subscribeToUpdates(),
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message'], frame.body);
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
    this.client?.deactivate();
    this.client = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.updatesSubject.complete();
  }

  private subscribeToUpdates(): void {
    if (!this.client?.connected) {
      return;
    }

    this.subscription?.unsubscribe();

    this.subscription = this.client.subscribe(URLs.eventsUpdatesTopic, (message: IMessage) =>
      this.handleMessage(message),
    );
  }

  private handleMessage(message: IMessage): void {
    try {
      const update = JSON.parse(message.body) as IEventUpdate;

      if (
        update.type !== 'EVENT_CREATED' &&
        update.type !== 'EVENT_UPDATED' &&
        update.type !== 'EVENT_DELETED'
      ) {
        return;
      }

      this.updatesSubject.next(update);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }
}
