import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FontSizes, Spacing } from "../../constants/theme";
import NestedScreenHeader from "../../src/components/NestedScreenHeader";
import { useAuth } from "../../src/context/AuthContext";
import { aiService } from "../../src/services/api";
import colors from "../../src/theme/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ).start();

    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  const dotStyle = (dot: Animated.Value) => ({
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textLight,
    marginHorizontal: 2,
    opacity: dot,
    transform: [
      {
        translateY: dot.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  });

  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4 }}
    >
      <Animated.View style={dotStyle(dot1)} />
      <Animated.View style={dotStyle(dot2)} />
      <Animated.View style={dotStyle(dot3)} />
    </View>
  );
}

export default function AICareerCounselor() {
  const router = useRouter();
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I am your AI Career Counselor. I'm here to help you navigate your professional journey. How can I assist you today?",
      sender: "ai",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      if (!userId) {
        throw new Error("User not authenticated.");
      }

      const response = await aiService.getCareerAdvice(
        Number(userId),
        userMessage.text,
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          response || "I'm sorry, I couldn't generate a response at this time.",
        sender: "ai",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          "Error: " +
          (error.response?.data?.message ||
            error.message ||
            "Failed to reach the AI counselor."),
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "user" ? styles.userBubble : styles.aiBubble,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.sender === "user" ? styles.userText : styles.aiText,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <View style={[styles.outerContainer, { paddingBottom: insets.bottom }]}>
      <View style={[styles.container, { paddingBottom: keyboardHeight }]}>
        <NestedScreenHeader
          title="AI Career Counselor"
          onBack={() => router.back()}
        />

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          ListFooterComponent={
            loading ? (
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <View style={styles.bubbleHeader}>
                  <Ionicons
                    name="sparkles"
                    size={18}
                    color={colors.secondary}
                  />
                  <Text style={styles.senderName}>AI Counselor</Text>
                </View>
                <TypingIndicator />
              </View>
            ) : null
          }
        />

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Ask about career paths, skills"
            value={inputText}
            onChangeText={setInputText}
            multiline
            placeholderTextColor={colors.textLight}
            editable={!loading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chatContainer: {
    padding: Spacing.MD,
    paddingBottom: Spacing.XL,
  },
  messageBubble: {
    maxWidth: "85%",
    padding: Spacing.MD,
    borderRadius: 16,
    marginBottom: Spacing.MD,
    elevation: 1,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.white,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
  },
  bubbleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  senderName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.XS,
    color: colors.textDark,
    opacity: 0.7,
  },
  messageText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    lineHeight: 22,
  },
  userText: {
    color: colors.textDark,
  },
  aiText: {
    color: colors.textDark,
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.MD,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F3F5",
    borderRadius: 24,
    paddingHorizontal: Spacing.LG,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: FontSizes.Base,
    fontFamily: "Poppins-Regular",
    maxHeight: 100,
    color: colors.textDark,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.SM,
  },
  sendButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  outerContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
