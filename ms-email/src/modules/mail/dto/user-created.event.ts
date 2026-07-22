// src/mail/dto/user-created.event.ts

export class UserCreatedEvent {

  id!: number;

  nome!: string;

  email!: string;

  // Chega DENTRO da mensagem, vindo do ms-users. É a "linha" que costura
  // os logs dos dois serviços. Opcional pra não quebrar mensagens antigas.
  correlationId?: string;

}