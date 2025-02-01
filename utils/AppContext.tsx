import React from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import Snackbar from 'react-native-snackbar';
import Constants from "expo-constants";
import { makeRedirectUri, AuthRequest, exchangeCodeAsync } from "expo-auth-session";
import { maybeCompleteAuthSession, openAuthSessionAsync } from "expo-web-browser";
import { ExpoSecureStore, mapLoginMethodParamsForUrl, StorageKeys, getClaims, setActiveStorage, UserProfile } from '@kinde/js-utils';
import { JWTDecoded, jwtDecoder } from "@kinde/jwt-decoder";
import { validateToken } from "@kinde/jwt-validator";


// import appsFlyer from 'react-native-appsflyer';

/*
if(!process.env.EXPO_PUBLIC_APPSFLYER_DEV_KEY) {
  throw new Error('Missing AppsFlyer dev key');
}

appsFlyer.initSdk({
  devKey: process.env.EXPO_PUBLIC_APPSFLYER_DEV_KEY,
  isDebug: true,
  appId: Platform.OS === 'android' ? 
    process.env.EXPO_PUBLIC_APPSFLYER_ANDROID_APP_ID : 
    process.env.EXPO_PUBLIC_APPSFLYER_IOS_APP_ID,
  onInstallConversionDataListener: true,
  onDeepLinkListener: true,
  timeToWaitForATTUserAuthorization: 60,
},
(result: any) => {
  console.log(`[FirebaseAuthContext] appsFlyer.initSdk: success`, result);
},
(error: any) => {
  console.warn(`[FirebaseAuthContext] appsFlyer.initSdk: error`, error);
});
*/

maybeCompleteAuthSession();

type Action = {
  type: string;
  [key: string]: any;
}

type AppState = {
  isLoggingIn: boolean;
  isLoggedIn: boolean;
  user: any | null;
  idToken: string | null;
  accessToken: string | null;
  error: any | null;
  contextDocs: Array<Record<string, any>>;
  isSubscribed: boolean;
  checkingSubscription: boolean;
  darkMode: "system" | "light" | "dark";
  login: () => void;
  register: () => void;
  logout: () => void;
  logEvent: (eventName: string, eventData: any) => void;
  secureSave: (key: string, obj: Record<string, any>) => Promise<void>;
  secureLoad: (key: string) => Promise<any>;
  localSave: (key: string, obj: any) => Promise<void>;
  localLoad: (key: string) => Promise<any>;
  showSnackbar: (message: string) => void;
  setContextDocs: (docs: any) => void;
  getContextDocs: () => Array<Record<string, any>>;
  setDarkMode: (darkMode: "system" | "light" | "dark") => void;
};

const initialState: AppState = {
  isLoggingIn: false,
  isLoggedIn: false,
  user: null,
  idToken: null,
  accessToken: null,
  error: null,
  contextDocs: [],
  isSubscribed: false,
  checkingSubscription: false,
  darkMode: "system",
  login: () => {},
  register: () => {},
  logout: () => {},
  logEvent: (eventName: string, eventData: any) => {},
  secureSave: (key: string, obj: Record<string, any>) => Promise.resolve(),
  secureLoad: (key: string) => Promise.resolve({}),
  localSave: (key: string, obj: any) => Promise.resolve(),
  localLoad: (key: string) => Promise.resolve({}),
  showSnackbar: (message: string) => {},
  setContextDocs: (docs: any) => {},
  getContextDocs: () => [],
  setDarkMode: (darkMode: "system" | "light" | "dark") => {},
};

function secureSave(key: string, obj: Record<string, any>) {
  return SecureStore.setItemAsync(key, JSON.stringify(obj));
}

async function secureLoad(key: string) {
  return SecureStore.getItemAsync(key)
    .then((res) => res ? JSON.parse(res) : res);
}

function localSave(key: string, obj: any) {
  return AsyncStorage.setItem(key, JSON.stringify(obj));
}

async function localLoad(key: string) {
  return AsyncStorage.getItem(key)
    .then((res) => res ? JSON.parse(res) : res);
}

function showSnackbar(message: string) {
  Snackbar.show({
    text: message,
    duration: Snackbar.LENGTH_SHORT,
  });
}


function reducer(state: AppState, action: Action) {
  switch (action.type) {
    case "LOGGING_IN":
      return { ...state, isLoggingIn: action.loggingIn };

    case "LOGGED_IN":
      return { ...state, isLoggingIn: false, isLoggedIn: !!action.user, user: action.user, idToken: action.idToken, accessToken: action.accessToken };

    case "SET_DARK_MODE":
      localSave('darkMode', action.darkMode);
      return { ...state, darkMode: action.darkMode ?? "system" };

    default:
      console.warn(`[FirebaseAuthContext] reducer: Unknown action type ${action.type}`);
      return state;
  }
}

export const AppContext = React.createContext(initialState);

export default function AppProvider( { children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const [code, setCode] = React.useState("");

  const redirectUri = makeRedirectUri({
    native: Constants.isDevice,
    path: "/login",
  });

  const store: ExpoSecureStore = new ExpoSecureStore();
  setActiveStorage(store);

  React.useEffect(() => {
    checkAuthentication();
    localLoad('darkMode').then((mode) => {
      dispatch({ type: "SET_DARK_MODE", darkMode: mode ?? 'system' });
    });
  }, []);

  /**
   *
   * @param tokenType Type of token to decode
   * @returns { Promise<JWTDecoded | null> }
   */
  async function getDecodedToken<
    T = JWTDecoded & {
      permissions: string[];
      org_code: string;
    },
  >(tokenType: "accessToken" | "idToken" = "accessToken"): Promise<T | null> {
    const token =
      tokenType === "accessToken" ? await getAccessToken() : await getIdToken();
    if (!token) {
      return null;
    }
    return jwtDecoder<T>(token);
  }


  async function authenticate(options = {}) {
    const request = new AuthRequest({
      clientId: process.env.EXPO_PUBLIC_KINDE_CLIENT_ID!,
      redirectUri,
      scopes: ['openid','profile','email','offline'],
      responseType: "code",
      extraParams: {
        has_success_page: "true",
        ...mapLoginMethodParamsForUrl(options)
      },
    });

    try {
      const codeResponse = await request.promptAsync(
        {
          authorizationEndpoint: `${process.env.EXPO_PUBLIC_KINDE_ISSUER_URL}/oauth2/auth`,
        },
        {
          showInRecents: true,
        },
      );
  
      if (request && codeResponse?.type === "success") {
        const exchangeCodeResponse = await exchangeCodeAsync(
          {
            clientId: process.env.EXPO_PUBLIC_KINDE_CLIENT_ID!,
            code: codeResponse.params.code,
            extraParams: request.codeVerifier
              ? { code_verifier: request.codeVerifier }
              : undefined,
            redirectUri,
          },
          {
            tokenEndpoint: `${process.env.EXPO_PUBLIC_KINDE_ISSUER_URL}/oauth2/token`,
          },
        );

        if(exchangeCodeResponse.idToken) {
          await store.setSessionItem(StorageKeys.idToken, exchangeCodeResponse.idToken);
          const idTokenValidationResult = await validateToken({
            token: exchangeCodeResponse.idToken,
            domain: process.env.EXPO_PUBLIC_KINDE_ISSUER_URL!,
          });
          if (idTokenValidationResult.valid) {
            console.debug(`[AppContext] authenticate: idTokenValidationResult is valid`, idTokenValidationResult);
            // await store.setSessionItem(StorageKeys.idToken, exchangeCodeResponse.idToken);
          } else {
            console.error(`Invalid id token`, idTokenValidationResult.message);
          }
        }

        if(exchangeCodeResponse.accessToken) {
          await store.setSessionItem(StorageKeys.accessToken, exchangeCodeResponse.accessToken);
          const accessTokenValidationResult = await validateToken({
            token: exchangeCodeResponse.accessToken,
            domain: process.env.EXPO_PUBLIC_KINDE_ISSUER_URL!,
          });
          if (accessTokenValidationResult.valid) {
            console.debug(`[AppContext] authenticate: accessTokenValidationResult is valid`, accessTokenValidationResult);
            // await store.setSessionItem(StorageKeys.accessToken, exchangeCodeResponse.accessToken);
          } else {
            console.error(`Invalid access token`, accessTokenValidationResult.message);
          }
        }

        // console.log(await getClaims());

        return {
          success: true,
          accessToken: exchangeCodeResponse.accessToken,
          idToken: exchangeCodeResponse.idToken!,
        };
      } else {
        return { success: false, errorMessage: "No code response" };
      }
    } catch (err: any) {
      console.error(err);
      return { success: false, errorMessage: err.message };
    }
  };

  async function getAccessToken(): Promise<string | null> {
    const token = await store.getSessionItem(StorageKeys.accessToken);
    return typeof token === 'string' ? token : null;
  }

  async function getIdToken(): Promise<string | null> {
    const token = await store.getSessionItem(StorageKeys.idToken);
    return typeof token === 'string' ? token : null;
  }

  async function getUserProfile(): Promise<UserProfile | null> {
    const idToken = await getDecodedToken<{
      sub: string;
      given_name: string;
      family_name: string;
      email: string;
      picture: string;
    }>("idToken");
    if (!idToken) {
      return null;
    }
    return {
      id: idToken.sub,
      givenName: idToken.given_name,
      familyName: idToken.family_name,
      email: idToken.email,
      picture: idToken.picture,
    };
  }

  async function checkAuthentication() {
    try {
      console.log(`[AppContext] checkAuthentication: start`);
      dispatch({ type: "LOGGING_IN", loggingIn: true });
      const accessToken = await getAccessToken();
      const idToken = await getIdToken();
      if(accessToken) {
        console.log(`[AppContext] checkAuthentication: accessToken found`);
        const userProfile = await getUserProfile();
        dispatch({ type: "LOGGED_IN", user: userProfile, idToken: idToken, accessToken: accessToken });
      } else {
        console.log(`[AppContext] checkAuthentication: no accessToken found`);
        dispatch({ type: "LOGGED_IN", user: null, idToken: null, accessToken: null });
      }
    } catch(error) {
      console.warn(`[AppContext] checkAuthentication exception`, error);
      dispatch({ type: "LOGGED_IN", user: null, idToken: null, accessToken: null });
    } finally {
      dispatch({ type: "LOGGING_IN", loggingIn: false });
    }
  }

  async function login() {
    try {
      dispatch({ type: "LOGGING_IN", loggingIn: true });
      const token = await authenticate({ prompt: "login" });
      if(token) {
        console.log(`[AppContext] login successful`);
        checkAuthentication();
        // appsFlyer.logEvent('af_login', {});
      } else {
        console.warn(`[AppContext] login: no token returned`);
        showSnackbar(`Login failed: no token returned`);
        // appsFlyer.logEvent('af_login_error', { error: 'no token returned' });
      }
    } catch(error) {
      console.warn(`[AppContext] login exception`, error);
      showSnackbar(`Login failed: ${error}`);
      // appsFlyer.logEvent('af_login_error', { error });
    } finally {
      dispatch({ type: "LOGGING_IN", loggingIn: false });
    }
  }

  async function register() {
    try {
      dispatch({ type: "LOGGING_IN", loggingIn: true });
      const token = await authenticate({ prompt: "signup" });
      if(token) {
        console.log(`[AppContext] register successful: token`, token);
        checkAuthentication();
        // appsFlyer.logEvent('af_register', {});
      } else {
        console.warn(`[AppContext] register: no token returned`);
        showSnackbar(`Register failed: no token returned`);
        // appsFlyer.logEvent('af_register_error', { error: 'no token returned' });
      }
    } catch(error) {
      console.warn(`[AppContext] register exception`, error);
      showSnackbar(`Register failed: ${error}`);
      // appsFlyer.logEvent('af_register_error', { error });
    } finally {
      dispatch({ type: "LOGGING_IN", loggingIn: false });
    }
  }

  async function logout() {
    console.log(`[AppContext] logout: start`);
    try {
      dispatch({ type: "LOGGED_IN", user: null, idToken: null, accessToken: null });
      await openAuthSessionAsync(`${process.env.EXPO_PUBLIC_KINDE_ISSUER_URL}/logout?redirect=${redirectUri}`);
      await store.setSessionItem(StorageKeys.accessToken, null);
      await store.setSessionItem(StorageKeys.idToken, null);

      console.debug(`[AppContext] logout: signOut success`);
    } catch (error) {
      console.warn(`[AppContext] logout: signOut exception`, error);
    } finally {
      dispatch({ type: "LOGGING_IN", loggingIn: false });
    }
  }

  async function logEvent(eventName: string, eventData: any) {
    console.log(`[FirebaseAuthContext] log: ${eventName}`, eventData);
    // appsFlyer.logEvent(eventName, eventData);
  }

  const context = {
    ...state,
    login,
    register,
    logout,
    secureSave,
    secureLoad,
    localSave,
    localLoad,
    showSnackbar,
    logEvent,
    setDarkMode: (darkMode: "system" | "light" | "dark") => dispatch({ type: "SET_DARK_MODE", darkMode }),
  }

  return (
    <AppContext.Provider value={context}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error(`useAppContext must be used within a AppProvider`);
  }
  return context;
}