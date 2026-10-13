import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaEnvelope } from 'react-icons/fa';
import api from '../utils/api';

const BookingConfirmation = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    api
      .get(`/bookings/${id}`)
      .then((res) => setBooking(res.data?.data || null))
      .catch(() => setBooking(null));
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-ink-soft dark:text-ink-soft mb-2">Booking Confirmed!</h1>
      <p className="text-ink-soft-soft dark:text-ink-soft-soft mb-8">
        Your payment was successful and your homestay booking is confirmed.
      </p>

      <div className="bg-surface dark:bg-surface rounded-2xl shadow-lg p-6 text-left space-y-3 mb-8">
        <div className="flex justify-between">
          <span className="text-ink-soft-soft dark:text-ink-soft-soft">Booking ID</span>
          <span className="font-mono font-semibold">{booking?.bookingId || id}</span>
        </div>
        {booking?.homestay?.homestayName && (
          <div className="flex justify-between">
            <span className="text-ink-soft-soft dark:text-ink-soft-soft">Homestay</span>
            <span className="font-semibold">{booking.homestay.homestayName}</span>
          </div>
        )}
        {booking?.pricing?.totalAmount && (
          <div className="flex justify-between">
            <span className="text-ink-soft-soft dark:text-ink-soft-soft">Amount Paid</span>
            <span className="font-bold text-green-600">₹{booking.pricing.totalAmount}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-ink-soft-soft dark:text-ink-soft-soft">Status</span>
          <span className="font-semibold capitalize text-green-600">{booking?.payment?.status || 'paid'}</span>
        </div>
      </div>

      <p className="text-sm text-ink-soft-soft dark:text-ink-soft-soft mb-8 flex items-center justify-center gap-2">
        <FaEnvelope /> A confirmation has been sent to your registered email.
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
      >
        <FaHome /> Back to Home
      </Link>
    </div>
  );
};

export default BookingConfirmation;
