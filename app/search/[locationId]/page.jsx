"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_CURRENCY,
  DEFAULT_LANGUAGE,
  DEFAULT_PHOTO_LIMIT,
  DEFAULT_PHOTO_OFFSET,
} from "@/lib/tripadvisor-api/constants";

const locationDetailsAPI = async (locationId, params) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(
      `/api/locations/simplified/overview?locationId=${locationId}&${queryString}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch location details");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

const LocationDetailsPage = ({ params }) => {
  const { locationId } = params; // Destructure the locationId from params
  const router = useRouter();

  const [locationData, setLocationData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocationDetails = async () => {
      const data = await locationDetailsAPI(locationId, {
        language: DEFAULT_LANGUAGE, // Default language
        currency: DEFAULT_CURRENCY, // Default currency
        limit: DEFAULT_PHOTO_LIMIT, // Default limit for photos
        offset: DEFAULT_PHOTO_OFFSET, // Default offset
      });

      if (data && data.overview) {
        setLocationData(data);
        setError(null);
      } else if (data && !data.overview) {
        setError(
          "The specified location does not exist. Please try another location."
        );
      } else {
        setError("Failed to load location details. Please try again.");
      }
    };

    fetchLocationDetails();
  }, [locationId]);

  const handleGoBack = () => {
    router.push("/search");
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={handleGoBack}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md"
          >
            Go to Search Page
          </button>
        </div>
      </div>
    );
  }

  if (!locationData) {
    return <p className="text-gray-500">Loading...</p>;
  }

  const { overview, photos } = locationData;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-3xl mx-auto">
        {/* Location Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {overview.name}
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          <a
            href={overview.web_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View on TripAdvisor
          </a>
        </p>
        <p className="text-gray-600 mb-4">
          {overview.ranking_data?.ranking_string}
        </p>

        {/* Rating and Reviews */}
        <div className="flex items-center mb-4">
          <img
            src={overview.rating_image_url}
            alt="Rating"
            className="w-6 h-6 mr-2"
          />
          <p className="text-gray-700">{overview.rating} / 5</p>
          <p className="ml-2 text-gray-500">({overview.num_reviews} reviews)</p>
        </div>

        {/* Address and Contact Info */}
        <div className="mb-6">
          <p className="text-gray-600">
            <strong>Address:</strong> {overview.address_obj.address_string}
          </p>
          {overview.phone && (
            <p className="text-gray-600">
              <strong>Phone:</strong> {overview.phone}
            </p>
          )}
          {overview.website && (
            <p className="text-gray-600">
              <strong>Website:</strong>{" "}
              <a
                href={overview.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {overview.website}
              </a>
            </p>
          )}
        </div>

        {/* Features */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Features</h2>
          <ul className="list-disc list-inside text-gray-600">
            {overview.features?.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>

        {/* Opening Hours */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Opening Hours
          </h2>
          <ul className="text-gray-600">
            {overview.hours?.weekday_text.map((day, index) => (
              <li key={index}>{day}</li>
            ))}
          </ul>
        </div>

        {/* Cuisine */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Cuisine</h2>
          <p className="text-gray-600">
            {overview.cuisine
              ?.map((cuisine) => cuisine.localized_name)
              .join(", ")}
          </p>
        </div>

        {/* Subratings */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Subratings
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.values(overview.subratings).map((subrating, index) => (
              <div key={index} className="flex items-center">
                <img
                  src={subrating.rating_image_url}
                  alt={`${subrating.localized_name} Rating`}
                  className="w-6 h-6 mr-2"
                />
                <p className="text-gray-700">
                  {subrating.localized_name}: {subrating.value} / 5
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Photos</h2>
          <div className="grid grid-cols-2 gap-4">
            {photos.data?.map((photo) => (
              <div key={photo.id} className="flex flex-col items-center">
                <img
                  src={photo.images.medium.url}
                  alt={photo.caption}
                  className="rounded-md w-full object-cover h-40 mb-2"
                />
                {photo.caption && (
                  <p className="text-sm text-gray-500 text-center">
                    {photo.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            <a
              href={overview.see_all_photos}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              See all photos on TripAdvisor
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationDetailsPage;