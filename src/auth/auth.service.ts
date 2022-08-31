import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt'
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService, 
    // El jwtMosule del auth.module, es el que se encarga de decirle a ese servicio como definirse, horas de duación etc.
  ){}

  async create(createUserDto: CreateUserDto) {
    try{
      
      const {password, ...userData}=createUserDto;

      const user=this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });
      await this.userRepository.save(user);
      const {password:pass, ...resto }=user;
      return resto;
    }catch(error){
      this.handleDBErrors(error)
    }
  }


  async login(loginUserDto: LoginUserDto){
    const {password, email}=loginUserDto;
    const user=await this.userRepository.findOne({
      where: {email},
      select: {email: true, password: true, id: true}, //Si no hago esto no me devuelve la contraseña
    });

    if(!user)
      throw new UnauthorizedException('Credentials are not valid (email)')
    
    if(!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)')
    return {
      ...user,
      //token: this.getJWT({email: user.email})
      token: this.getJWT({id: user.id})
    };
  }

  async checkAuthStatus(user: User){
    return {
      ...user,
      token: this.getJWT({id: user.id})
    };
  }
  

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  private handleDBErrors(error: any){
    if(error.code==='23505')
      throw new BadRequestException(error.detail);
    console.log(error)
    throw new InternalServerErrorException('Please check server logs')
  }

  private getJWT(payload: JwtPayload){
    const token=this.jwtService.sign(payload);
    return token;
  }


}
