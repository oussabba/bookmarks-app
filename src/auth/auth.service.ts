import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

    signin() {
        return 'i have signed in';
    }

    signup() {
        return 'i have signed up';
    }
}
