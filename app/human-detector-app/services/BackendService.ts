import axios from 'axios';
import { executeNativeBackPress } from 'react-native-screens';
import { z } from 'zod';
import Group from '../classes/Group';
import User from '../classes/User';
import Notification from '../classes/Notification';
import * as ServerUrl from '../config/ServerConfig';

/**
 * This file handles HTTP requests to our backend
 */

/**
 * This method is used to get the group list that is connected to a user.  This group list
 * will contain cameras and other information that will be stored as a group object.
 *
 * @param userId : the userId of the user that we need the group list for.
 * @returns null if error occurs.
 *          An array of Groups that are owned by the user with the userId.
 */
export async function getGroupListAPI(userId: string): Promise<Group[] | null> {
  try {
    const apiLinkWithExtension: string =
      ServerUrl.apiLink + ServerUrl.getGroupsListUrlExtension(userId);
    const config = {
      headers: {
        Accept: 'application/json',
      },
    };

    const response = await axios.get(apiLinkWithExtension, config);
    return response.data;
  } catch (error) {
    console.error(`Error in getGroupListAPI status code: ${error.message}`);
    return null;
  }
}

/**
 * This method will send a notification token to the backend to be stored
 * through our endpoints.  This is done at login.
 *
 * @param userIdFromLogin : userId of the user that just logged in
 * @param expoTokenFromLogin : notification token of the user that just logged in
 * @returns void string if success, else it will return the error message
 */
export async function sendNotifyTokenAPI(
  userIdFromLogin: string,
  expoTokenFromLogin: string
): Promise<void> {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    const apiLinkWithExtension: string =
      ServerUrl.apiLink + ServerUrl.getSendNotifKeyUrlExtension(userIdFromLogin);
    const response = await axios.put(
      apiLinkWithExtension,
      {
        expoToken: expoTokenFromLogin,
      },
      config
    );
  } catch (error) {
    console.error(`Error in sendNotifyAPI status code ${error.message}`);
    return Promise.reject(error.message);
  }
  // no error: return void
}

/**
 * This method will get the notification history of a certain user through the backend.
 *
 * @param userId : user that we're searching for notifications for.
 * @returns null if error
 *          An array of notifications resembling notification history
 */
export async function getNotificationHistoryAPI(userId: string): Promise<Notification[] | null> {
  try {
    const apiLinkWithExtension: string =
      ServerUrl.apiLink + ServerUrl.getNotificationHistoryUrlExtension(userId);
    const config = {
      headers: {
        Accept: 'application/json',
      },
    };

    const response = await axios.get(apiLinkWithExtension, config);
    return response.data;
  } catch (error) {
    console.error(`Error in getNotificationHistoryAPI status code: ${error.message}`);
    return null;
  }
}

/**
 *  This method will send a code from login to the backend.  The backend will
 *  send back an access token which will be used to access the backend.
 *
 * @param code: The code the user will produce after logging in through Keycloak
 * @param redirectUri: redirectUri from the Keycloak auth request
 * @returns null if error
 *          Returns the object which will c
 */

export async function exchangeCodeForTokenAPI(
  code: string,
  redirectUri: string
): Promise<object | null> {
  try {
    const apiLinkWithExtension: string =
      ServerUrl.apiLink + ServerUrl.exchangeCodeForTokenUrlExtension;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    const body = {
      code,
      redirectUri,
    };

    const response = await axios.post(apiLinkWithExtension, body, config);

    return response.data;
  } catch (error) {
    console.error(`Error in exchangeCodeForTokenAPI status code: ${error.message}`);
    return null;
  }
}
