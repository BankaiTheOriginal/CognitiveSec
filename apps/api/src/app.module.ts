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
import { ConfigModule } from '@nestjs/config';
import configuration from 'configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', './apps/api/.env'],
    }),
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
