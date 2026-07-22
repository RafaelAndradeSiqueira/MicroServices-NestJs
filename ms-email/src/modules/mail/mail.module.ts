// src/mail/mail.module.ts

import { Module } from '@nestjs/common';
import { MailConsumer } from './mail.consumer';
import { MailService } from './mail.service'

@Module({
  controllers: [
    MailConsumer,
  ],
  providers: [
    MailService,
  ],
})
export class MailModule {}