import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Briefcase,
  Calendar,
  ChevronLeft,
  GraduationCap,
  Mail,
  User,
  Shield,
  Building,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontSizes, Spacing } from "../../../constants/theme";
import { profileService } from "../../../src/services/api";
import colors from "../../../src/theme/colors";

export default function UserDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // First try fetching as alumni
      try {
        const alumniData = await profileService.getAlumniProfile(Number(id));
        if (alumniData && alumniData.user) {
          setProfile({ ...alumniData, role: 'ALUMNI' });
          setLoading(false);
          return;
        }
      } catch (e) {}

      // Then try fetching as student
      try {
        const studentData = await profileService.getStudentProfile(Number(id));
        if (studentData && studentData.user) {
          setProfile({ ...studentData, role: 'STUDENT' });
          setLoading(false);
          return;
        }
      } catch (e) {}
      
      setError("User profile not found or user has not completed their profile setup.");
    } catch (err: any) {
      setError("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft color={colors.white} size={20} />
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isAlumni = profile.role === 'ALUMNI';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <ChevronLeft color={colors.textDark} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={60} color={colors.primary} />
          </View>
          <Text style={styles.fullName}>{profile.user?.fullName || "User"}</Text>
          <Text style={styles.username}>@{profile.user?.username}</Text>
          <View style={[styles.roleBadge, { backgroundColor: isAlumni ? '#fef3c7' : '#dbeafe' }]}>
            <Text style={[styles.roleText, { color: isAlumni ? '#d97706' : colors.primary }]}>{profile.role}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Mail size={18} color={colors.textLight} />
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile.user?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Shield size={18} color={colors.textLight} />
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>{profile.role}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic & Professional</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Building size={18} color={colors.textLight} />
              <Text style={styles.infoLabel}>Institution</Text>
              <Text style={styles.infoValue}>{profile.institutionName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Calendar size={18} color={colors.textLight} />
              <Text style={styles.infoLabel}>{isAlumni ? 'Graduation Year' : 'Expected Grad'}</Text>
              <Text style={styles.infoValue}>{isAlumni ? profile.graduationYear : profile.expectedGraduationYear}</Text>
            </View>
            {isAlumni && (
              <>
                <View style={styles.infoRow}>
                  <Briefcase size={18} color={colors.textLight} />
                  <Text style={styles.infoLabel}>Current Company</Text>
                  <Text style={styles.infoValue}>{profile.currentCompany || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <GraduationCap size={18} color={colors.textLight} />
                  <Text style={styles.infoLabel}>Industry</Text>
                  <Text style={styles.infoValue}>{profile.industry || 'N/A'}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {profile.details && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details</Text>
            <View style={styles.infoCard}>
              <Text style={styles.detailsText}>
                {profile.details.bio || "No bio available for this user."}
              </Text>
              {profile.details.skills && profile.details.skills.length > 0 && (
                <View style={styles.skillsContainer}>
                  {profile.details.skills.map((skill: string, index: number) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.LG,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.white,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.textDark },
  backIcon: { padding: 4 },
  placeholder: { width: 32 },
  scrollContent: { padding: Spacing.LG },
  profileHeader: { alignItems: "center", marginBottom: 30 },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f9ff',
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  fullName: { fontSize: 22, fontWeight: "800", color: colors.textDark, marginBottom: 4 },
  username: { fontSize: 14, color: colors.textLight, marginBottom: 12 },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.textDark, marginBottom: 12 },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: Spacing.MD,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  infoLabel: { fontSize: 14, color: colors.textLight, flex: 1, marginLeft: 12 },
  infoValue: { fontSize: 14, fontWeight: "600", color: colors.textDark },
  detailsText: { fontSize: 14, color: "#475569", lineHeight: 22 },
  skillsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  skillBadge: { backgroundColor: "#f1f5f9", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  skillText: { fontSize: 12, color: "#475569", fontWeight: "600" },
  errorText: { fontSize: 14, color: colors.danger, marginBottom: 20, textAlign: "center", paddingHorizontal: 40 },
  backBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  backBtnText: { color: colors.white, fontWeight: "700" },
});
