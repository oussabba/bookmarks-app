import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

    async signin(authDto: AuthDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: authDto.email,
            }
        });
        if (!user) {
            throw new ForbiddenException('Invalid credentials');
        }
        const pwMatches = await argon.verify(user.hash, authDto.password);
        if (!pwMatches) {
            throw new ForbiddenException('Invalid credentials');
        }
        delete user.hash;
        return user;
    }

    async signup(authDto: AuthDto) {
        try {
            const hash = await argon.hash(authDto.password);
            const user = await this.prisma.user.create({
                data: {
                    email: authDto.email,
                    hash
                }
            });
            delete user.hash;
            return user;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Credentials taken');
                }
            }
            throw error;
        }
    }
}
