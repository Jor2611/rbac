import { UseInterceptors } from "@nestjs/common"
import { SerializeInterceptor, ClassConstructor } from "../interceptors/serialize.interceptor"

export const Serialize = (dto: ClassConstructor) => {
  return UseInterceptors(new SerializeInterceptor(dto))
}