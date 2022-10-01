import { v4 } from 'uuid';
import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  UuidType,
} from '@mikro-orm/core';
import { Group } from '../groups/group.entity';

@Entity()
export class Camera {
  @PrimaryKey({ type: UuidType })
  id = v4();

  @Property()
  name!: string;

  @Property()
  token!: string;

  @ManyToOne(() => Group)
  group: Group;

  constructor(name: string, token: string) {
    this.name = name;
    this.token = token;
  }
}
