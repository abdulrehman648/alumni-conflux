import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useBooking } from "../../../src/context/BookingContext";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function MentorDetails() {

  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addBooking } = useBooking();

  const mentors = [
    {
      id: "1",
      name: "Ali Khan",
      role: "Senior Software Engineer – Google",
      skills: "React, Node, AI, Cloud",
      image: require("../../../assets/images/images/mentor2.png"),
    },
    {
      id: "2",
      name: "Usman Ali",
      role: "Frontend Developer – Meta",
      skills: "React Native, UI/UX",
      image: require("../../../assets/images/images/mentor2.png"),
    },
    {
      id: "3",
      name: "Ahmed Raza",
      role: "Backend Engineer – Amazon",
      skills: "Node, Express, MongoDB",
      image: require("../../../assets/images/images/mentor2.png"),
    },
  ];

  const mentor = mentors.find((m) => m.id === id);

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  // reviews per mentor
  const [reviews, setReviews] = useState<{ [key: string]: any[] }>({});

  const [selectedTime, setSelectedTime] = useState("");
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const timeSlots = ["10:00 AM", "12:00 PM", "3:00 PM", "6:00 PM"];

  // submit review
  const submitReview = () => {
    if (review === "") {
      alert("Write review first");
      return;
    }

    setReviews((prev) => ({
      ...prev,
      [id as string]: [
        ...(prev[id as string] || []),
        { rating, text: review }
      ]
    }));

    setReview("");
    setRating(0);
  };

  const handleBooking = () => {
    if (!selectedTime) {
      alert("Select time slot");
      return;
    }

    addBooking({
      mentorId: id as string,
      mentorName: mentor?.name || "Unknown",
      date: date.toDateString(),
      time: selectedTime
    });

    alert("Session Booked");
    router.push("/(student)/bookings");
  };

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

        <Image source={mentor?.image} style={styles.image} />

        <Text style={styles.name}>{mentor?.name}</Text>

        <Text style={styles.role}>{mentor?.role}</Text>

        <Text style={styles.skills}>
          Skills: {mentor?.skills}
        </Text>

        <Text style={styles.heading}>Select Date</Text>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowCalendar(true)}
        >
          <Text style={styles.dateText}>
            {date.toDateString()}
          </Text>
        </TouchableOpacity>

        {showCalendar && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowCalendar(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <Text style={styles.heading}>Select Time Slot</Text>

        {timeSlots.map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.slot,
              selectedTime === time && styles.selected
            ]}
            onPress={() => setSelectedTime(time)}
          >
            <Text style={styles.slotText}>{time}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.bookButton,
            !selectedTime && { opacity: 0.5 }
          ]}
          disabled={!selectedTime}
          onPress={handleBooking}
        >
          <Text style={styles.buttonText}>Book Session</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Rate Mentor</Text>

        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Text style={styles.star}>
                {rating >= star ? "⭐" : "☆"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.heading}>Write Review</Text>

        <TextInput
          placeholder="Write your review"
          style={styles.input}
          value={review}
          onChangeText={setReview}
          multiline
        />

        <TouchableOpacity
          style={styles.reviewButton}
          onPress={submitReview}
        >
          <Text style={styles.buttonText}>Submit Review</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Student Reviews</Text>

        {!(reviews[id as string]?.length) ? (
          <Text style={{ textAlign: "center", marginTop: 10 }}>
            No reviews yet
          </Text>
        ) : (
          reviews[id as string].map((item, index) => (
            <View key={index} style={styles.reviewCard}>
              <Text style={styles.reviewRating}>
                ⭐ {item.rating}
              </Text>
              <Text>{item.text}</Text>
            </View>
          ))
        )}

      </ScrollView>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F4EAD8",
    padding: 20
  },

  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 15
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
    color: "#0F4C4F",
    marginBottom: 20
  },

  heading: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 15
  },

  dateButton: {
    backgroundColor: "#0F4C4F",
    padding: 12,
    borderRadius: 8,
    alignItems: "center"
  },

  dateText: {
    color: "white"
  },

  slot: {
    backgroundColor: "#0F4C4F",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },

  selected: {
    backgroundColor: "#2E8B8B"
  },

  slotText: {
    color: "white"
  },

  bookButton: {
    backgroundColor: "#0F4C4F",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10
  },

  ratingRow: {
    flexDirection: "row",
    marginTop: 10
  },

  star: {
    fontSize: 30,
    marginRight: 5
  },

  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    minHeight: 60
  },

  reviewButton: {
    backgroundColor: "#0F4C4F",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10
  },

  buttonText: {
    color: "white",
    fontWeight: "bold"
  },

  reviewCard: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10
  },

  reviewRating: {
    color: "#FFD700",
    marginBottom: 5
  }

});