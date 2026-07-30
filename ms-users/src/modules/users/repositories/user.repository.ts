import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "../dtos/create-user.dto";
import { UpdateUserDto } from "../dtos/update-user.dto";
import { PrismaService } from "src/modules/global/prisma/prisma.service";

@Injectable()
export class UsersRepository{
    constructor(
        private readonly prismaService: PrismaService
    ){}


    async findAll(){
        return await this.prismaService.users.findMany();
    }

    async create(user: CreateUserDto){
        const userCreated = await this.prismaService.users.create({
            data: {
                name: user.name,
                email: user.email
            }
        });

        return userCreated;
    }

    async update(id: string, data: UpdateUserDto){
        const user = await this.prismaService.users.update({
            where: {
                id,
            },
            data,
        })
        return user;
    }


    async delete(id: string) {
        return await this.prismaService.users.delete({ where: { id } });
    }

    async deleteAll(){
        return await this.prismaService.users.deleteMany()
    }
}