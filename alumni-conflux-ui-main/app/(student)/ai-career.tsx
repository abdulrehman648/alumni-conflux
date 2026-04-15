import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FontSizes, Spacing } from "../../constants/theme";
import { useAuth } from "../../src/context/AuthContext";
import { aiService } from "../../src/services/api";
import colors from "../../src/theme/colors";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
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

  useEffect(() => {
    // Scroll to bottom when messages change
    if (flatListRef.current) {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
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

      // We call the career advice endpoint
      const response = await aiService.getCareerAdvice(Number(userId), userMessage.text);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response || "I'm sorry, I couldn't generate a response at this time.",
        sender: "ai",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Error: " + (error.response?.data?.message || error.message || "Failed to reach the AI counselor."),
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
      <View style={styles.bubbleHeader}>
        <Ionicons 
            name={item.sender === "user" ? "person-circle" : "sparkles"} 
            size={18} 
            color={item.sender === "user" ? colors.primary : colors.secondary} 
        />
        <Text style={styles.senderName}>
            {item.sender === "user" ? "You" : "AI Counselor"}
        </Text>
      </View>
      <Text style={[
        styles.messageText,
        item.sender === "user" ? styles.userText : styles.aiText
      ]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                 <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <View>
                <Text style={styles.headerTitle}>AI Career Counselor</Text>
                <Text style={styles.headerSubtitle}>Personalized Career Guidance</Text>
            </View>
            <Ionicons name="bulb-outline" size={24} color={colors.white} style={{ marginLeft: 'auto' }} />
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>The AI is thinking...</Text>
          </View>
        )}

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Ask about career paths, skills, or alumni..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            placeholderTextColor={colors.textLight}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: colors.primary,
    padding: Spacing.LG,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: Spacing.MD,
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: FontSizes.LG,
    color: colors.white,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    color: "rgba(255,255,255,0.8)",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.white,
    borderBottomRightRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
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
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.SM,
    gap: 8,
  },
  loadingText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    color: colors.textLight,
  },
});
