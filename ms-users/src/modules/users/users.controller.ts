import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";


@Controller('users')
export class UsersController{
    constructor(
        private readonly UsersService: UsersService
    ){}

    @Get()
    async findAll(){
        return await this.UsersService.findAll()
    }

    @Post()
    async create(@Body() body: CreateUserDto){
        return await this.UsersService.create(body)
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: UpdateUserDto){
        return await this.UsersService.update(id, body)
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return await this.UsersService.delete(id);
    }

    @Delete()
    async deleteAll(){
        return await this.UsersService.deleteAll();
    }
}