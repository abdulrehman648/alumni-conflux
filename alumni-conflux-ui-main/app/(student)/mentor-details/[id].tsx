import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { mentorshipService } from "../../../src/services/api";
import { useAuth } from "../../../src/context/AuthContext";
import colors from "../../../src/theme/colors";
import Toast from "react-native-toast-message";

export default function MentorDetails() {

  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { userId } = useAuth();
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
     fetchMentorDetails();
  }, [id]);

  const fetchMentorDetails = async () => {
    try {
      setLoading(true);
      const mentors = await mentorshipService.getAvailableMentors();
      const found = mentors.find(m => m.alumniId === Number(id));
      setMentor(found);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch mentor details' });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMentorship = async () => {
    if (!userId) return;
    setSubmitting(true);
    try {
      await mentorshipService.requestMentorship(Number(userId), Number(id), message);
      Toast.show({ type: 'success', text1: 'Request Sent', text2: 'Mentor will be notified' });
      router.back();
    } catch (error: any) {
      Toast.show({ 
        type: 'error', 
        text1: 'Request Failed', 
        text2: error.response?.data?.message || 'Could not send request' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>;
  if (!mentor) return <View style={styles.center}><Text>Mentor not found</Text></View>;

  return (

    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.avatarContainer}>
           <Text style={styles.avatarLetter}>{mentor.name.charAt(0)}</Text>
        </View>

        <Text style={styles.name}>{mentor.name}</Text>
        <Text style={styles.role}>{mentor.industry}</Text>
        <Text style={styles.skills}>{mentor.currentCompany}</Text>

        <View style={styles.requestSection}>
          <Text style={styles.heading}>Why do you want mentorship?</Text>
          <TextInput
            placeholder="Introduce yourself and explain your goals..."
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
          />
          
          <TouchableOpacity
            style={[styles.bookButton, submitting && { opacity: 0.7 }]}
            disabled={submitting}
            onPress={handleRequestMentorship}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Send Mentorship Request</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },

  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    alignSelf: "center",
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  avatarLetter: {
    color: colors.white,
    fontSize: 48,
    fontFamily: 'Poppins-Bold',
    fontWeight: 'bold'
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center"
  },

  role: {
    textAlign: "center",
    marginBottom: 10
  },

  skills: {
    textAlign: "center",
    color: colors.primary,
    marginBottom: 20
  },

  requestSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontFamily: 'Poppins-SemiBold'
  },

  bookButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20
  },

  input: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top'
  },

  heading: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textDark,
    marginBottom: 5
  },
});