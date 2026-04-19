import { Edit2, X } from "lucide-react-native";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect } from "react";
import { apiClient } from "../../src/services/api";
import colors from "../../src/theme/colors";

interface StudentProfile {
  fullName: string;
  username: string;
  email: string;
  institutionName: string;
  expectedGraduationYear: number;
  department: string;
  degreeProgram: string;
  major: string;
  currentSemester: number;
  skills: string[];
  careerPreferences: string[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  userId: string;
  onUpdate: () => void;
}

export default function StudentProfileModal({
  visible,
  onClose,
  userId,
  onUpdate,
}: Props) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState<StudentProfile | null>(null);

  useEffect(() => {
    if (visible && userId) {
      fetchProfile();
    }
  }, [visible, userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/student/${userId}`);
      setProfile(response.data);
      setEditData(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editData) return;
    try {
      setLoading(true);
      const response = await apiClient.put(`/student/${userId}`, editData);
      setProfile(response.data);
      setEditData(response.data);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    fetchProfile();
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Student Profile</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading && <Text style={styles.loadingText}>Loading...</Text>}

          {!isEditing && profile ? (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>User Details</Text>
                <ProfileField label="Full Name" value={profile.fullName} />
                <ProfileField label="Username" value={profile.username} />
                <ProfileField label="Email" value={profile.email} />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Education</Text>
                <ProfileField
                  label="Institution"
                  value={profile.institutionName}
                />
                <ProfileField label="Department" value={profile.department} />
                <ProfileField
                  label="Degree Program"
                  value={profile.degreeProgram}
                />
                <ProfileField label="Major" value={profile.major} />
                <ProfileField
                  label="Current Semester"
                  value={profile.currentSemester.toString()}
                />
                <ProfileField
                  label="Expected Graduation"
                  value={profile.expectedGraduationYear.toString()}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Skills</Text>
                <View style={styles.tagsContainer}>
                  {profile.skills?.map((skill, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Career Preferences</Text>
                <View style={styles.tagsContainer}>
                  {profile.careerPreferences?.map((pref, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{pref}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : isEditing && editData ? (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>User Details</Text>
                <EditField
                  label="Full Name"
                  value={editData.fullName}
                  onChangeText={(text) =>
                    setEditData({ ...editData, fullName: text })
                  }
                />
                <EditField
                  label="Username"
                  value={editData.username}
                  onChangeText={(text) =>
                    setEditData({ ...editData, username: text })
                  }
                />
                <EditField
                  label="Email"
                  value={editData.email}
                  onChangeText={(text) =>
                    setEditData({ ...editData, email: text })
                  }
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Education</Text>
                <EditField
                  label="Institution"
                  value={editData.institutionName}
                  onChangeText={(text) =>
                    setEditData({ ...editData, institutionName: text })
                  }
                />
                <EditField
                  label="Department"
                  value={editData.department}
                  onChangeText={(text) =>
                    setEditData({ ...editData, department: text })
                  }
                />
                <EditField
                  label="Degree Program"
                  value={editData.degreeProgram}
                  onChangeText={(text) =>
                    setEditData({ ...editData, degreeProgram: text })
                  }
                />
                <EditField
                  label="Major"
                  value={editData.major}
                  onChangeText={(text) =>
                    setEditData({ ...editData, major: text })
                  }
                />
                <EditField
                  label="Current Semester"
                  value={editData.currentSemester.toString()}
                  onChangeText={(text) =>
                    setEditData({
                      ...editData,
                      currentSemester: parseInt(text) || 1,
                    })
                  }
                />
                <EditField
                  label="Expected Graduation"
                  value={editData.expectedGraduationYear.toString()}
                  onChangeText={(text) =>
                    setEditData({
                      ...editData,
                      expectedGraduationYear: parseInt(text) || 0,
                    })
                  }
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Skills (comma separated)
                </Text>
                <EditField
                  label="Skills"
                  value={editData.skills?.join(", ")}
                  onChangeText={(text) =>
                    setEditData({
                      ...editData,
                      skills: text
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Career Preferences (comma separated)
                </Text>
                <EditField
                  label="Career Preferences"
                  value={editData.careerPreferences?.join(", ")}
                  onChangeText={(text) =>
                    setEditData({
                      ...editData,
                      careerPreferences: text
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </View>
            </>
          ) : null}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          {!isEditing ? (
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => setIsEditing(true)}
            >
              <Edit2 size={18} color="white" />
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setIsEditing(false);
                  setEditData(profile);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function EditField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View style={styles.editField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.editFieldInput}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 2,
    fontWeight: "600",
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  field: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fieldLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 14,
    color: colors.text,
  },
  editField: {
    marginBottom: 12,
  },
  editFieldInput: {
    fontSize: 14,
    color: colors.text,
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: 6,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  tagText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
});
