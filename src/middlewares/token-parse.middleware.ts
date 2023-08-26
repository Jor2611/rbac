import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request, Response, NextFunction } from "express";
import { Roles } from "../account/constants/rolePermissions";

declare global {
  namespace Express {
    interface Request {
      decoded?: TokenData,
      accessType: string
    }
  }
}

interface TokenData {
  id: number;
  email: string;
  role: Roles | 'root';
  iat: number;
  exp: number
}

@Injectable()
export class TokenParse implements NestMiddleware{
  constructor( private jwtService: JwtService, private config: ConfigService){}
  
  async use(req: Request, res: Response, next: NextFunction) {
    if(req.headers['authorization']){
      const [strategy, token] = req.headers['authorization'].split(' ');

      if(strategy !== 'Bearer'){
        throw new UnauthorizedException();
      }
      
      req.decoded = await this.parseToken(token);
    }
    req.accessType = 'none';
    return next();
  }

  private async parseToken(token: string): Promise<TokenData>{
    try{
      await this.jwtService.verifyAsync(token);
    }catch(err){
      throw new UnauthorizedException();
    }

    return this.jwtService.decode(token) as TokenData;
  }
}