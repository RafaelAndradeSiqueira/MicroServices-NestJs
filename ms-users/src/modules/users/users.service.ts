import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { UsersRepository } from "./repositories/user.repository";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { getCorrelationId } from "../../config/correlation";


@Injectable()
export class UsersService {
    constructor(
        private readonly repository: UsersRepository,
        private readonly rabbit: RabbitMQService,
        @InjectPinoLogger(UsersService.name)
        private readonly logger: PinoLogger,
    ) {}

    async findAll(){
        return await this.repository.findAll()
    }

    async create(body: CreateUserDto){
        const startedAt = Date.now();

        this.logger.info({ email: body.email }, 'criando usuário');

        const user = await this.repository.create(body);

        if (user) {
            const correlationId = getCorrelationId();

            await this.rabbit.publish('user.created', {
                id: user.id,
                nome: user.name,
                email: user.email,
                correlationId,
            });

            this.logger.info(
                { userId: user.id, durationMs: Date.now() - startedAt },
                'usuário criado e evento publicado',
            );

            return user;
        }
        this.logger.warn({ email: body.email }, 'usuário não foi criado (resultado vazio)');
    }

    async update(id: string, body: UpdateUserDto){
        return await this.repository.update(id,body)
    }

    async delete(id: string){
        return await this.repository.delete(id)
    }

    async deleteAll(){
        return await this.repository.deleteAll();
    }
}
