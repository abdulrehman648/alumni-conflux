import React, { createContext, useContext, useState } from "react";

type Booking = {
  mentorId: string;
  mentorName: string;
  date: string;
  time: string;
};

type BookingContextType = {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  cancelBooking: (index: number) => void; // ✅ ADD THIS
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: React.ReactNode }) => {

  const [bookings, setBookings] = useState<Booking[]>([]);

  const addBooking = (booking: Booking) => {
    setBookings((prev) => [...prev, booking]);
  };
  const cancelBooking = (index: number) => {
  setBookings((prev) => prev.filter((_, i) => i !== index));
};

  return (
    <BookingContext.Provider value={{ bookings, addBooking ,cancelBooking}}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used inside BookingProvider");
  }
  return context;
};