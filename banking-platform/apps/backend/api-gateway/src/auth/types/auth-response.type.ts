import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserProfile {
  @Field()
  fullName: string;

  @Field()
  docType: string;

  @Field()
  docNumber: string;
}

@ObjectType()
export class AuthResponse {
  @Field(() => UserProfile)
  user: UserProfile;
}
