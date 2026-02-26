import {
  launchImageLibrary,
  ImageLibraryOptions,
} from "react-native-image-picker";
import React, { use, useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { EditorBridge } from "@10play/tentap-editor";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

// Define la interfaz para las props del componente
interface TextEditorToolbarProps {
  editor: EditorBridge | null;
  isDark?: boolean;
}

// Componente funcional para el botón de la barra de herramientas
const ToolButton = ({
  icon,
  onPress,
  isActive = false,
  textColor,
  symbol,
  title,
}: {
  icon?: any;
  onPress: () => void;
  isActive: boolean;
  textColor: string;
  symbol?: string;
  title?: string;
}) => {

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.toolButton,
        pressed && { opacity: 0.7 },
      ]}
    >
      <View
        style={[
          styles.iconContainer, isActive && { backgroundColor: "#1d4ed8", borderRadius: 10 }
        ]}
      >
        {icon ? (
          <FontAwesome
            name={icon}
            size={18}
            color={isActive ? "#ffffff" : textColor}
          />
        ) : (
          <Text style={[styles.iconText, { color: isActive ? "#ffffff" : textColor }]}>
            {symbol}
          </Text>
        )}
      </View>
      {title && <Text style={[styles.titleText, { color: textColor }]}>{title}</Text>}
    </Pressable>
  )
}

const TextEditorToolbar: React.FC<TextEditorToolbarProps> = ({
  editor,
  isDark = true,
}) => {
  const isDarkTheme = isDark ?? true;
  const bgColor = isDarkTheme ? "black" : "#F5F5F5";
  const textColor = isDarkTheme ? "#FFFFFF" : "#000000";
  const borderColor = isDarkTheme ? "#444" : "#DDD";

  const insets = useSafeAreaInsets();

  // Estado y animación para el teclado
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Listeners para el teclado
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const height = e.endCoordinates.height;
        setKeyboardHeight(height);
        // Mueve la toolbar hacia arriba
        translateY.value = withSpring(-height, {
          damping: 25,
          stiffness: 50,
        });
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        // Regresa la toolbar a su posición original
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 90,
        });
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Estilo animado
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // ---- Manejadores de acciones del editor ----

  const toggleBold = useCallback(() => editor?.toggleBold(), [editor]);
  const toggleItalic = useCallback(() => editor?.toggleItalic(), [editor]);
  const toggleStrike = useCallback(() => editor?.toggleStrike(), [editor]);
  const toggleH1 = useCallback(() => editor?.toggleHeading(1), [editor]);
  const toggleH2 = useCallback(() => editor?.toggleHeading(2), [editor]);
  const toggleH3 = useCallback(() => editor?.toggleHeading(3), [editor]);
  const toggleBulletList = useCallback(() => editor?.toggleBulletList(), [editor]);
  const toggleOrderedList = useCallback(() => editor?.toggleOrderedList(), [editor]);
  const toggleBlockquote = useCallback(() => editor?.toggleBlockquote(), [editor]);

  const setLink = useCallback(() => {
    Alert.prompt("Introduce la URL", "", (url) => {
      if (url) {
        editor?.setLink(url);
      }
    });
  }, [editor]);

  const onImagePick = useCallback(async () => {
    const options: ImageLibraryOptions = {
      mediaType: "photo",
      quality: 0.8,
      includeBase64: true,
    };

    await launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorCode) {
        Alert.alert("Error", `ImagePicker Error: ${response.errorMessage}`);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.base64 && asset.type) {
          const uri = `data:${asset.type};base64,${asset.base64}`;
          editor?.setImage(uri);
        }
      }
    });
  }, [editor]);

  if (!editor) {
    return null;
  }

  const [isActiveButton, setIsActiveButton] = useState(false);

  const toggleActive = () => {
    setIsActiveButton(prev => !prev);
  };
  return (
    <Animated.View
      style={[
        styles.toolbarWrapper,
        animatedStyle,
        {
          bottom: Platform.OS === 'ios' ? insets.bottom : 30,
        }
      ]}
    >

      <View style={[styles.toolbarContainer, { backgroundColor: bgColor }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* --- Botones de formato --- */}
          <ToolButton
            icon="bold"
            textColor={textColor}
            isActive={isActiveButton}
            onPress={() => {
              toggleActive();
              toggleItalic();
            }}
          />
          <ToolButton
            icon="italic"
            textColor={textColor}
            isActive={isActiveButton}
            onPress={() => {
              toggleActive();
              toggleItalic();
            }}
          />
          <ToolButton
            icon="strikethrough"
            textColor={textColor}
            isActive={isActiveButton}
            onPress={() => {
              toggleActive();
              toggleItalic();
            }}
          />
          <ToolButton
            symbol="H1"
            textColor={textColor}
            isActive={false}
            onPress={() => {
              toggleActive();
              toggleItalic();
            }}
          />
          <ToolButton
            symbol="H2"
            textColor={textColor}
            isActive={false}
            onPress={() => {
              toggleActive();
              toggleItalic();
            }}
          />
          <ToolButton
            symbol="H3"
            textColor={textColor}
            isActive={false}
            onPress={() => {
              toggleActive();
              toggleItalic();
            }}
          />
          <ToolButton
            icon="list-ul"
            textColor={textColor}
            isActive={false}
            onPress={() => {
              toggleActive();
              toggleItalic();
            }}
          />
          <ToolButton
            icon="list-ol"
            textColor={textColor}
            isActive={false}
            onPress={() => {
              toggleActive();
              toggleItalic();
            }}
          />
          <ToolButton
            icon="quote-left"
            textColor={textColor}
            isActive={false}
            onPress={() => {
              toggleActive();
              toggleItalic();
            }}
          />
          <ToolButton
            icon="link"
            textColor={textColor}
            isActive={false}
            onPress={() => {
              toggleActive();
              toggleItalic();
            }}
          />
          <ToolButton
            icon="image"
            textColor={textColor}
            isActive={false}
            onPress={() => {
              toggleActive();
              toggleItalic();
            }}
          />

          {/* --- Color de texto --- */}
          <ToolButton
            symbol="A"
            title="White"
            textColor={"white"}
            isActive={false}
            onPress={() => {
              editor?.setColor("white")
              toggleActive();
            }}
          />
          <ToolButton
            symbol="A"
            title="Rojo"
            textColor={"red"}
            isActive={false}
            onPress={() => editor?.setColor("red")}
          />
          <ToolButton
            symbol="A"
            title="Azul"
            textColor={"blue"}
            isActive={false}
            onPress={() => editor?.setColor("blue")}
          />
        </ScrollView>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toolbarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  toolbarContainer: {
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 12,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#4444",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toolButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    marginHorizontal: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  titleText: {
    fontSize: 10,
  },
});

export default TextEditorToolbar;