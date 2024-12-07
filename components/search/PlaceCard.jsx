"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, addDoc, limit } from "firebase/firestore";
import { firestore } from "@/app/firebase/config";
import StarRatingDisplay from "../StarRatingDisplay";


//check if business is open or closed
const isOpenNow = (periods) => {
  if (!periods || periods.length === 0) return false;

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = parseInt(
    now.toTimeString().slice(0, 2) + now.toTimeString().slice(3, 5)
  );

  //loop thru to see if time falls in period times
  for (const period of periods) {
    if (period.open.day === currentDay) {
      const openTime = parseInt(period.open.time);
      const closeTime = parseInt(period.close.time);

      //check if curr time is between open and closing times
      if (openTime <= currentTime && (closeTime > currentTime || closeTime < openTime)) {
        return true;
      }
    }
  }
  return false;
};

// Main PlaceCard component
const PlaceCard = ({ id, name, address, openingHours, imageUrl, price, weekdayText, }) => {
  const openStatus = isOpenNow(openingHours?.periods);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  // Fetch average rating and review count
  useEffect(() => {
    const fetchAverageRating = async () => {
      try {
        const reviewsRef = collection(firestore, "reviews");
        const reviewsQuery = query(reviewsRef, where("locationId", "==", id));
        const reviewsSnapshot = await getDocs(reviewsQuery);

        const reviews = reviewsSnapshot.docs.map((doc) => doc.data());
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const count = reviews.length;

        setAverageRating(count > 0 ? totalRating / count : 0);
        setReviewCount(count);
      } catch (error) {
        console.error("Error fetching reviews for PlaceCard:", error);
      }
    };
    fetchAverageRating();
  }, [id, weekdayText]);

  // Fetch thumbnail image from Firestore
  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        const photosRef = collection(firestore, "locations", id, "photos");
        const photosQuery = query(photosRef, limit(1)); // Limit to the first photo
        const photosSnapshot = await getDocs(photosQuery);

        if (!photosSnapshot.empty) {
          const photoData = photosSnapshot.docs[0].data();
          setThumbnailUrl(photoData.url); // Use the `url` field from the photo document
        }
      } catch (error) {
        console.error("Error fetching thumbnail for PlaceCard:", error);
      }
    };

    fetchThumbnail();
  }, [id]);

  return (
    <div className="card card-side bg-base-100 shadow-xl rounded-xl relative">
      {/* Open/Closed Status on card */}
      <div className="absolute top-2 right-2">
        <p
          className={`ml-1 text-lg font-semibold ${openStatus ? "text-green-600" : "text-red-600"}`}
        >
          {openStatus ? "Open Now" : "Closed"}
        </p>
      </div>

      {/* Image Section */}
      <figure>
        <img
          src={
            thumbnailUrl ||
            "https://fakeimg.pl/500x500?text=No+Images" // Placeholder if no image
          }
          alt={name}
          className="w-60 h-60 object-cover"
        />
      </figure>

      {/* Content Section */}
      <div className="card-body text-base-content">
        <h2 className="card-title">{name}</h2>
        <p>{address || "No address available"}</p>
        {price && (
          <p className="ml-1 text-gray-800 text-sm">
            {Array(price)
              .fill("$")
              .join("")}
          </p>
        )}
        <div>
          <StarRatingDisplay rating={averageRating} reviewCount={reviewCount} />
        </div>

        <div className="card-actions justify-end">
          <a
            href={`/search/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            View More
          </a>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;