import React from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import Snackbar from 'react-native-snackbar';
import { useKindeAuth } from "@kinde/expo";
import Constants from "expo-constants";
import { makeRedirectUri, useAutoDiscovery } from "expo-auth-session";
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


type Action = {
  type: string;
  [key: string]: any;
}

type AppState = {
  isLoggingIn: boolean;
  isLoggedIn: boolean;
  user: any | null;
  idToken: string | null;
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
      return { ...state, isLoggingIn: false, isLoggedIn: !!action.user, user: action.user, idToken: action.idToken };

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
  const client = useKindeAuth();

  const redirectUri = makeRedirectUri({ native: Constants.isDevice });
  if(!process.env.EXPO_PUBLIC_KINDE_ISSUER_URL) {
    throw new Error('Missing EXPO_PUBLIC_KINDE_ISSUER_URL');
  }
  const discovery = useAutoDiscovery(process.env.EXPO_PUBLIC_KINDE_ISSUER_URL);
  // console.debug(`[AppContext] AppProvider: discovery`, discovery, redirectUri);

  React.useEffect(() => {
    checkAuthentication();
    localLoad('darkMode').then((mode) => {
      dispatch({ type: "SET_DARK_MODE", darkMode: mode ?? 'system' });
    });
  }, []);

  async function checkAuthentication() {
    try {
      console.log(`[AppContext] checkAuthentication: start`);
      dispatch({ type: "LOGGING_IN", loggingIn: true });
      if (client.isAuthenticated) {
        const userProfile = await client.getUserProfile();
        const token = await client.getIdToken();
        // if(userProfile.id) appsFlyer.setCustomerUserId(user.uid);
        console.log(`[AppContext] checkAuthentication: userProfile`, userProfile);
        dispatch({ type: "LOGGED_IN", user: userProfile, idToken: token });
      } else {
        console.log(`[AppContext] checkAuthentication: user is not authenticated`);
        dispatch({ type: "LOGGED_IN", user: null, idToken: null });
      }
    } catch(error) {
      console.warn(`[AppContext] checkAuthentication exception`, error);
      dispatch({ type: "LOGGED_IN", user: null, idToken: null });
    } finally {
      dispatch({ type: "LOGGING_IN", loggingIn: false });
    }
  }

  async function login() {
    try {
      dispatch({ type: "LOGGING_IN", loggingIn: true });
      const token = await client.login();
      if(token) {
        console.log(`[AppContext] login successful: token`, token);
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
      const token = await client.register();
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
      dispatch({ type: "LOGGING_IN", loggingIn: true });
      const loggedOut = await client.logout();
      if (loggedOut) {
        // User was logged out
        console.debug(`[AppContext] logout: signOut success`);
        checkAuthentication();
      } else {
        console.warn(`[AppContext] logout: signOut failed`);
      }
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