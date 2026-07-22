import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { UsersRepository } from "./repositories/user.repository";
import { RabbitMQModule } from "../rabbitmq/rabbitmq.module";


@Module({
    imports:[RabbitMQModule],
    controllers: [UsersController],
    providers:[UsersService, UsersRepository]    
})

export class UsersModule{};
