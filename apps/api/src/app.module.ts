import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { DocumentModule } from './modules/document/document.module';
import { TeamsModule } from './modules/teams/teams.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { QueueConfigModule } from './modules/queue/queue-config.module';

@Module({
  imports: [
    QueueConfigModule,
    AuthModule,
    ChatModule,
    DocumentModule,
    TeamsModule,
    UsersModule,
    OrganizationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
