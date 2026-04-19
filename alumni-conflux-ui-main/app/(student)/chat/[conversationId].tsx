import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { FontSizes, Spacing } from "../../../constants/theme";
import NestedScreenHeader from "../../../src/components/NestedScreenHeader";
import { useAuth } from "../../../src/context/AuthContext";
import { mentorshipService } from "../../../src/services/api";
import colors from "../../../src/theme/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ChatMessage = {
  id: number;
  senderUserId: number;
  senderName: string;
  content: string;
  createdAt: string;
};

export default function MentorChatScreen() {
  const router = useRouter();
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { userId } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const parsedConversationId = useMemo(
    () =>
      Number(
        Array.isArray(conversationId) ? conversationId[0] : conversationId,
      ),
    [conversationId],
  );

  const mentorName = useMemo(() => {
    const mentorMessage = messages.find(
      (message) => Number(message.senderUserId) !== Number(userId),
    );
    return mentorMessage?.senderName?.trim() || "Mentor Chat";
  }, [messages, userId]);

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
    const loadMessages = async () => {
      if (!userId || !parsedConversationId) return;
      try {
        setLoading(true);
        const data = await mentorshipService.getConversationMessages(
          parsedConversationId,
          Number(userId),
        );
        setMessages(data);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load chat messages",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [parsedConversationId, userId]);

  useEffect(() => {
    if (!parsedConversationId || !userId) return;

    const pollMessages = async () => {
      try {
        const data = await mentorshipService.getConversationMessages(
          parsedConversationId,
          Number(userId),
        );
        setMessages(data);
      } catch {
        // Keep silent in fallback poll mode to avoid noisy toasts every few seconds.
      }
    };

    pollMessages();
    const intervalId = setInterval(pollMessages, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [parsedConversationId, userId]);

  const sendMessage = async () => {
    const trimmed = draft.trim();
    if (!trimmed || !userId || !parsedConversationId) return;

    setSending(true);
    try {
      const savedMessage = await mentorshipService.sendConversationMessage(
        parsedConversationId,
        Number(userId),
        trimmed,
      );

      if (savedMessage) {
        setMessages((current) => [...current, savedMessage]);
      }

      setDraft("");
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={[styles.outerContainer, { paddingBottom: insets.bottom }]}>
      <View style={[styles.container, { paddingBottom: keyboardHeight }]}>
        <NestedScreenHeader title={mentorName} onBack={() => router.back()} />

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.flex}>
            <FlatList
              data={messages}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isMine = Number(item.senderUserId) === Number(userId);
                return (
                  <View
                    style={[
                      styles.bubble,
                      isMine ? styles.myBubble : styles.theirBubble,
                    ]}
                  >
                    <Text style={styles.senderName}>
                      {isMine ? "You" : item.senderName}
                    </Text>
                    <Text style={styles.messageText}>{item.content}</Text>
                    <Text style={styles.timeText}>
                      {item.createdAt?.substring(11, 16)}
                    </Text>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>No messages yet</Text>
                  <Text style={styles.emptyText}>
                    Start the conversation with your mentor.
                  </Text>
                </View>
              }
            />

            <View style={styles.composer}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Write a message..."
                placeholderTextColor={colors.textLight}
                style={styles.input}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!draft.trim() || sending) && styles.sendButtonDisabled,
                ]}
                onPress={sendMessage}
                disabled={!draft.trim() || sending}
              >
                <Ionicons name="send" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: Spacing.LG,
    gap: Spacing.SM,
    paddingBottom: Spacing.XL,
  },
  bubble: {
    maxWidth: "82%",
    padding: Spacing.MD,
    borderRadius: 16,
    marginBottom: Spacing.SM,
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  theirBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  senderName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.XS,
    color: colors.textLight,
    marginBottom: 1,
  },
  messageText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    color: colors.textDark,
  },
  timeText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
    color: colors.textLight,
    textAlign: "right",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.Base,
    color: colors.textDark,
  },
  emptyText: {
    marginTop: 6,
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.SM,
    color: colors.textLight,
    textAlign: "center",
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.SM,
    padding: Spacing.MD,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 24,
    paddingHorizontal: Spacing.LG,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    color: colors.textDark,
    backgroundColor: "#F1F3F5",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.SM,
  },
  sendButtonDisabled: {
    backgroundColor: colors.textLight,
    opacity: 0.7,
  },
  connectionStateRow: {
    paddingHorizontal: Spacing.LG,
    paddingTop: Spacing.XS,
    paddingBottom: Spacing.MD,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.SM,
  },
  connectionStateText: {
    color: colors.textLight,
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.XS,
  },
  connectionStateTextWrap: {
    flex: 1,
    gap: 2,
  },
  connectionStateEndpoint: {
    color: colors.textLight,
    fontFamily: "Poppins-Regular",
    fontSize: 10,
  },
  reconnectButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.XS,
  },
  reconnectButtonText: {
    color: colors.textDark,
    fontFamily: "Poppins-SemiBold",
    fontSize: FontSizes.XS,
  },
});
