import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { apiClient } from "../../src/services/api";

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

export default function StudentProfile() {
  const { userId } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("Ali");
  const [interest, setInterest] = useState("");
  const [skills, setSkills] = useState("");
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/student/${userId}`);
      setProfile(response.data);
      setName(response.data.fullName);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permission required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets?.[0]?.uri;
      if (uri) {
        setImage(uri);
      }
    }
  };

  const handleSave = () => {
    alert("Profile Updated");
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={
          image
            ? { uri: image }
            : require("../../assets/images/images/mentor2.png")
        }
        style={styles.image}
      />

      <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
        <Text style={styles.uploadText}>Upload Image</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Name"
      />

      <TextInput
        style={styles.input}
        value={interest}
        onChangeText={setInterest}
        placeholder="Interest (AI, Web Dev)"
      />

      <TextInput
        style={styles.input}
        value={skills}
        onChangeText={setSkills}
        placeholder="Skills"
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.btnText}>Save Profile</Text>
      </TouchableOpacity>

      {/* Profile Details Sections */}
      {profile && !loading && (
        <>
          {/* User Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Full Name</Text>
              <Text style={styles.detailValue}>{profile.fullName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Username</Text>
              <Text style={styles.detailValue}>{profile.username}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{profile.email}</Text>
            </View>
          </View>

          {/* Education */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Institution</Text>
              <Text style={styles.detailValue}>{profile.institutionName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Department</Text>
              <Text style={styles.detailValue}>{profile.department}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Degree Program</Text>
              <Text style={styles.detailValue}>{profile.degreeProgram}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Major</Text>
              <Text style={styles.detailValue}>{profile.major}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Current Semester</Text>
              <Text style={styles.detailValue}>{profile.currentSemester}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expected Graduation</Text>
              <Text style={styles.detailValue}>
                {profile.expectedGraduationYear}
              </Text>
            </View>
          </View>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.tagsContainer}>
                {profile.skills.map((skill, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Career Preferences */}
          {profile.careerPreferences &&
            profile.careerPreferences.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Career Preferences</Text>
                <View style={styles.tagsContainer}>
                  {profile.careerPreferences.map((pref, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{pref}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F4EAD8",
  },

  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 10,
  },

  uploadBtn: {
    backgroundColor: "#0F4C4F",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },

  uploadText: {
    color: "#fff",
    fontWeight: "bold",
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  button: {
    backgroundColor: "#0F4C4F",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  section: {
    marginTop: 20,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F4C4F",
    marginBottom: 12,
  },

  detailRow: {
    marginBottom: 12,
  },

  detailLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: "400",
    color: "#333",
  },

  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  tag: {
    backgroundColor: "#0F4C4F15",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#0F4C4F",
  },

  tagText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#0F4C4F",
  },
});
