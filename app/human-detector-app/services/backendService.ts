import axios, { AxiosInstance } from 'axios';
import Group from '../classes/Group';
import Notification from '../classes/Notification';
import User from '../classes/User';
import * as ServerUrl from '../config/ServerConfig';
import TokenManager from '../src/auth/tokenManager';

/**
 * Handles authenticated requests to the backend.
 */
export default class BackendService {
  private readonly tokenManager: TokenManager;

  /**
   * Axios instance with common headers added (mainly auth)
   */
  private readonly axiosInstance: AxiosInstance;

  constructor(tokenManager: TokenManager) {
    this.tokenManager = tokenManager;

    // Add authorization and accept headers to each request
    this.axiosInstance = axios.create();
    this.axiosInstance.interceptors.request.use(async (config) => {
      const accessToken = await this.tokenManager.getAccessToken();
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      Object.assign(config.headers!.common, headers);
      return config;
    });
  }

  private getUser(): User {
    return this.tokenManager.getUser();
  }

  /**
   * Registers the camera in the backend and returns the UUID of it.
   * 
   * @param name New camera name
   * @param serial New camera serial
   * @param publicKey New camera's public key
   * @param groupId Group ID to put camera in
   * @returns Camera UUID
   */
  public async registerCamera(
    name: string,
    serial: string,
    publicKey: string,
    groupId: string
  ): Promise<string | null> {
    const apiLinkWithExtension: string = 
      ServerUrl.apiLink + ServerUrl.registerCameraUrlExtension(this.getUser().userID, groupId);
    
    try {
      const response = await this.axiosInstance.put(
        apiLinkWithExtension,
        {
          name,
          serial,
          publicKey
        }
      );

      return response.data.id;
    } catch (error) {
      console.error(`Error in registerCamera status code:`, error);
      return null;
    }
  }

  /**
   * This method is used to get the group list that is connected to a user.  This group list
   * will contain cameras and other information that will be stored as a group object.
   *
   * @returns null if error occurs.
   *          An array of Groups that are owned by the user with the userId.
   */
  public async getGroupListAPI(): Promise<Group[] | null> {
    try {
      const apiLinkWithExtension: string =
        ServerUrl.apiLink + ServerUrl.getGroupsListUrlExtension(this.getUser().userID);

      const response = await this.axiosInstance.get(apiLinkWithExtension);
      return response.data;
    } catch (error) {
      console.error(`Error in getGroupListAPI status code:`, error);
      return null;
    }
  }

  /**
   * This method will send a notification token to the backend to be stored
   * through our endpoints.  This is done at login.
   *
   * @param expoTokenFromLogin : notification token of the user that just logged in
   * @returns void if success, else it will return the error message
   */
  public async sendNotifyTokenAPI(expoTokenFromLogin: string): Promise<void> {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const apiLinkWithExtension: string =
        ServerUrl.apiLink + ServerUrl.getSendNotifKeyUrlExtension(this.getUser().userID);

      await this.axiosInstance.put(
        apiLinkWithExtension,
        {
          expoToken: expoTokenFromLogin,
        },
        config
      );
      return undefined;
    } catch (error) {
      console.error(`Error in sendNotifyAPI status code:`, error);
      return Promise.reject(error);
    }
    // no error: return void
  }

  /**
   * This method will get the notification history of a certain user through the backend.
   *
   * @returns null if error
   *          An array of notifications resembling notification history
   */
  public async getNotificationHistoryAPI(): Promise<Notification[] | null> {
    try {
      const apiLinkWithExtension: string =
        ServerUrl.apiLink + ServerUrl.getNotificationHistoryUrlExtension(this.getUser().userID);
      const config = {
        headers: {
          Accept: 'application/json',
        },
      };

      const response = await this.axiosInstance.get(apiLinkWithExtension, config);
      return response.data;
    } catch (error) {
      console.error(`Error in getNotificationHistoryAPI status code:`, error);
      return null;
    }
  }
}
