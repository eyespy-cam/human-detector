import { Collection, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { NotFoundError } from '../errors.types';
import { Camera } from '../cameras/camera.entity';
import { Group } from '../groups/group.entity';
import { User } from './user.entity';
import { RegisterCameraBody } from './users.controller';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: EntityRepository<User>,
    @InjectRepository(Group) private groupRepository: EntityRepository<Group>,
  ) {}

  /**
   * Gets the given user's camera groups.
   *
   * @param userId the user's ID.
   * @throws {@link NotFoundError}
   * Thrown if the given user ID doesn't correspond to an existing user.
   */
  public async getGroups(userId: string): Promise<Collection<Group>> {
    const user = await this.usersRepository.findOne(
      { id: userId },
      {
        populate: [
          'groups.cameras',
          'groups.cameras.notifications',
          'groups.cameras.notifications.snapshot.id',
        ],
      },
    );
    if (user === null) {
      throw new NotFoundError(`User with ID "${userId}" does not exist.`);
    }
    return user.groups;
  }
  /**
   * Register a group to the given user
   *
   * @param userId the user's ID
   * @param groupName the name of the group that it is to be given
   */

  public async registerGroup(
    userId: string,
    groupName: string,
  ): Promise<Group> {
    // find and populate user.groups
    const user = await this.usersRepository.findOne(
      { id: userId },
      { populate: ['groups'] },
    );

    if (user == null) {
      throw new NotFoundError(`User with ID "${userId}" does not exist`);
    }

    if (user.id != userId) {
      throw new NotFoundError(`Pulled user with wrong ID!`);
    }

    // Make an empty group
    const newGroup = new Group(groupName);
    user.groups.add(newGroup);

    await this.usersRepository.flush();
    return newGroup;
  }

  /**
   * Deletes a given group from the user's list of created groups.
   *
   * @param userId the user's ID
   * @param groupObj the Group that the user wants to delete
   */
  public async deleteGroup(
    userId: string,
    groupObj: Group, // it would be ideal to send the Group object and not the Group id/name since we need the object for removing it from mikroorm.
  ): Promise<Boolean> {
    // find and populate user.groups and user.groups.cameras
    const user = await this.usersRepository.findOne(
      { id: userId },
      { populate: ['groups', 'groups.cameras'] },
    )

    if (user == null) {
      throw new NotFoundError(`User with ID "${userId}" does not exist`);
    }

    if (user.id != userId) {
      throw new NotFoundError(`Pulled user with wrong ID!`);
    }
    // checks if the groupObj is not in the list of groups for the user.
    if (!user.groups.contains(groupObj)) {
      throw new NotFoundError(`Group "${groupObj.name}" was not found in the list of groups`)
    }
    // ensures that no cameras are in the group.
    if (groupObj.cameras.length != 0) {
      throw new Error(`Group "${groupObj.name}" is not empty and still has cameras associated with it on the backend.`)
    } 
 
    //user.groups.remove(groupObj);
    this.usersRepository.remove(groupObj);
    await this.usersRepository.flush();

    return true;
  }

  /**
   * Register a camera to the given user and group
   *
   * @param userId the user's ID.
   * @param groupId the group ID.
   * @param cameraDetails the name, serial, and public key of a new camera.
   */
  public async registerCamera(
    userId: string,
    groupId: string,
    cameraDetails: RegisterCameraBody,
  ): Promise<Camera> {
    const group = await this.groupRepository.findOne(
      { id: groupId },
      { populate: ['user', 'cameras'] },
    );

    if (group === null) {
      throw new NotFoundError(`Group with ID "${groupId}" does not exist.`);
    }

    if (group.user.id !== userId) {
      throw new NotFoundError(`User with ID "${userId}" does not exist.`);
    }

    const newCamera = new Camera(
      cameraDetails.name,
      cameraDetails.publicKey,
      cameraDetails.serial,
    );

    group.cameras.add(newCamera);
    await this.groupRepository.flush();

    return newCamera;
  }

  /**
   * Update's the user's push notification token.
   *
   * @param userId the user's ID.
   * @param notifyToken the new notification token.
   */
  public async updateNotifyToken(
    userId: string,
    notifyToken: string,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({ id: userId });
    if (user === null) {
      throw new NotFoundError(`User with ID "${userId}" does not exist.`);
    }
    user.expoToken = notifyToken;
    await this.usersRepository.flush();
  }
}
