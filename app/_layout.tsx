// import {
//   DarkTheme,
//   DefaultTheme,
//   ThemeProvider as NavigationThemeProvider,
// } from "@react-navigation/native";
// import { Redirect, Stack, usePathname } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { View } from "react-native";
// import "react-native-reanimated";

// import {
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from "react-native-safe-area-context";

// import FloatingNavBar from "@/components/FloatingNavBar";
// import { useColorScheme as useAppColorScheme } from "@/hooks/use-color-scheme";
// import { ThemeProvider, useTheme } from "@/hooks/use-theme";
// import { useEffect, useState } from "react";

// export default function RootLayout() {
//   return (
//     <ThemeProvider>
//       <SafeAreaProvider>
//         <RootLayoutContent />
//       </SafeAreaProvider>
//     </ThemeProvider>
//   );
// }

// function RootLayoutContent() {
//   const pathname = usePathname();
//   const insets = useSafeAreaInsets();
//   const colorScheme = useAppColorScheme();
//   const isDark = colorScheme === "dark";
//   // const { isLoggedIn,  isLoading } = useTheme();
//   const [isLogged, setIsLogged] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const login = async () => {
//     setIsLoading(true);
//     // aquí podrías guardar token
//     setIsLogged(true);
//     setIsLoading(false);
//   };

//   // const backgroundColor = isDark ? "#101010" : DefaultTheme.colors.background;

//   // const isLogged = useAuthStore((s) => s.isLogged); // o tu contexto
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // aqui revisamos si hay sesion activa, por ejemplo revisando un token en AsyncStorage
//     setTimeout(() => {

//       setLoading(false); // Simula que la verificación ha terminado
//     }, 1000); // Simula un retraso de 1 segundo para la verificación
//   }, []);

//   // indicador de carga mientras se verifica la sesión
//   if (isLoading) { return null; } // O un indicador de carga

//   // const isAuthRoute = pathname === "/login";

//   // if (!isLogged && pathname !== '/login') {
//   //   return <Redirect href="/login" />;
//   // }

//   return (
//     <>
//       {/* {!isLogged && pathname !== "/login" && (
//         <Redirect href="/login" />
//       )}
//       {isLogged && pathname === "/login" && (
//         <Redirect href="/listview" />
//       )} */}

//       <Stack screenOptions={{ headerShown: false }} />
//       <FloatingNavBar />
//       {/* <StatusBar style={isDark ? "light" : "dark"} /> */}
//       {/* {!isLogged && !isAuthRoute && <Redirect href="/login" />} */}
//     </>
//   );
// }
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Redirect, Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import FloatingNavBar from "@/components/FloatingNavBar";
import { useColorScheme as useAppColorScheme } from "@/hooks/use-color-scheme";
import { ThemeProvider } from "@/hooks/use-theme";
import { UserProvider, useUser } from "@/context/UserContext";

export default function RootLayout() {
  return (
    <UserProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <RootLayoutContent />
        </SafeAreaProvider>
      </ThemeProvider>
    </UserProvider>
  );
}

function RootLayoutContent() {
  const pathname = usePathname();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === "dark";

  // Ahora viene del contexto real, no de estado local
  const { user, isLoading } = useUser();
  const isAuthenticated = !!user;

  // Mientras se verifica la sesión guardada, no renderizar nada
  if (isLoading) return null;

  return (
    <>
      {/* Redirigir a login si no está autenticado */}
      {!isAuthenticated && pathname !== "/login" && (
        <Redirect href="/login" />
      )}

      {/* Redirigir a la app si ya está autenticado e intenta ir al login */}
      {isAuthenticated && pathname === "/login" && (
        <>
          <Redirect href="/App" />
          {/* <FloatingNavBar /> */}
        </>
      )}

      <Stack screenOptions={{ headerShown: false }} />

      {
        pathname !== "/login" ? <><FloatingNavBar /></> : (
          null
        )
      }
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}